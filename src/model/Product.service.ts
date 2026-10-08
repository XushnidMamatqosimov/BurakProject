import { shapeIntMogooseObjectId } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Product, ProductInput, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";

class ProductService {
    private readonly productModel;

    constructor(){
        this.productModel = ProductModel;
    }
    // SPA
    // SSR
    public async createNewProduct(input: ProductInput): Promise<Product> {
        try{
            return await this.productModel.create(input);
            
        }catch (err){
            console.log("Errors, modelCreateNewProduct: ", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async updateProduct(id: string, input: ProductUpdateInput): Promise<Product> {
        id = shapeIntMogooseObjectId(id);
        const res = await this.productModel.findOneAndUpdate({_id: id}, input, {new: true}).exec();
        if(!res) throw new Errors(HttpCode.NOT_MODIFIED, Message.CREATE_FAILED);
        console.log(res);
        return res;
    }

}

export default ProductService;