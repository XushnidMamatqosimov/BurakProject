import mongoose from "mongoose";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { ProductStatus } from "../libs/enums/productEnum";
import { Product, ProductInquiry } from "../libs/types/product";
import { invalidInput, isRecord } from "../libs/utils/member";
import ProductModel from "../schema/Product.model";
import { T } from "../libs/types/common";
import { Types } from "mongoose";
import { shapeIntMogooseObjectId } from "../libs/config";
import ViewService from "./View.service";
import { ViewInput } from "../libs/types/view";
import { ViewGroup } from "../libs/enums/viewEnum";
import { ObjectId } from "mongoose";

const productFields = [
  "productStatus", "productCollection", "productName", "productPrice", "productCount",
  "productSize", "productVolume", "productDesc", "productImages", "productViews",
] as const;



function inventoryCount(value: unknown): number {
  if (typeof value !== "number" && (typeof value !== "string" || !value.trim())) {
    throw invalidInput();
  }
  const count = Number(value);
  if (!Number.isSafeInteger(count) || count < 0) throw invalidInput();
  return count;
}

// Keep the database vocabulary while accepting the existing admin form's aliases.
function normalizeProductInput(input: unknown, creating: boolean): Record<string, unknown> {
  if (!isRecord(input)) throw invalidInput();
  const result: Record<string, unknown> = {};
  for (const field of productFields) {
    if (input[field] !== undefined) result[field] = input[field];
  }
  const hasCount = Object.prototype.hasOwnProperty.call(input, "productCount");
  const hasAlias = Object.prototype.hasOwnProperty.call(input, "productLeftCount");
  if (creating && !hasCount && !hasAlias) throw invalidInput();
  if (hasCount || hasAlias) {
    const count = inventoryCount(hasCount ? input.productCount : input.productLeftCount);
    if (hasCount && hasAlias && count !== inventoryCount(input.productLeftCount)) throw invalidInput();
    result.productCount = count;
  }
  if (input.productStatus !== undefined) {
    const status = input.productStatus === "PROCESS" ? ProductStatus.PROSSESS
      : input.productStatus === "DELETE" ? ProductStatus.DELETED : input.productStatus;
    if (!Object.values(ProductStatus).some(value => value === status)) throw invalidInput();
    result.productStatus = status;
  }
  if (!Object.keys(result).length) throw invalidInput();
  return result;
}

class ProductService {
  private readonly productModel;
  private viewService;

  constructor() {
    this.productModel = ProductModel;
    this.viewService = new ViewService();
  }

  // SPA //
  public async getProducts(inquiry: ProductInquiry): Promise<Product[]> {
    console.log("servicega keldi");
    const match: T = { productStatus: ProductStatus.PROSSESS }

    if (inquiry.productCollection) {
      match.productCollection = inquiry.productCollection;
    }
    if (inquiry.search) {
      match.productName = { $regex: new RegExp(inquiry.search, "i") };
    }
    const sort: T =
      inquiry.order === "productPrice" ?
        { [inquiry.order]: 1 }
        : { [inquiry.order]: -1 };

    const result = await this.productModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        { $skip: (inquiry.page * 1 - 1) * inquiry.limit }, // necha element skip qilinib, undan keyingi elementlar tanlanishini belgilab beradi
        { $limit: inquiry.limit * 1 },
      ]).exec();

    if (result.length === 0) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    console.log("serviceda validationlardan otdi");
    return result;
  }

  public async getProduct(memberId: ObjectId | null, id: string): Promise<Product> {
    const productId = shapeIntMogooseObjectId(id);
    //user login bolmagan user bolsa
    let result = await this.productModel
      .findOne({
        _id: productId,
        productStatus: ProductStatus.PROSSESS
      }
      ).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

    // user login bolgan user bolsa;
    if (memberId) {
      //checkExistence
      const input: ViewInput = {
        memberId: memberId, viewRefId: productId, viewGroup: ViewGroup.PRODUCT
      }
      const existView = await this.viewService.checkViewExistence(input);
      
      if (!existView) {
        //insert view
        console.log("Planning to insert new View");
        await this.viewService.insertMemberView(input);
      }

      //increase viewCount
      result = await this.productModel
        .findByIdAndUpdate(
          productId, { $inc: { productViews: +1 } }, { new: true }
        ).exec();
    }

    return result;
  }


  // SSR //
  public async getAllProducts(): Promise<Product[]> {
    return this.productModel.find().exec();
  }

  public async createNewProduct(input: unknown): Promise<Product> {
    const product = normalizeProductInput(input, true);
    try {
      return await this.productModel.create(product);
    } catch {
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  public async updateProduct(id: unknown, input: unknown): Promise<Product> {
    if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) throw invalidInput();
    const product = normalizeProductInput(input, false);
    try {
      const result = await this.productModel.findOneAndUpdate(
        { _id: new mongoose.Types.ObjectId(id) },
        { $set: product },
        { new: true, runValidators: true },
      ).exec();
      if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
      return result;
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
        throw invalidInput();
      }
      throw error;
    }
  }
}

export default ProductService;
