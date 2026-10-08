import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AdminRequest } from "../libs/types/member";
import { ProductInput } from "../libs/types/product";
import ProductService from "../model/Product.service";

const productService = new ProductService();

const productController: T = {};

productController.getAllProducts = async (req: AdminRequest, res: Response) => {
    try {
        console.log("GetAllProduts method from productController");
        console.log("req.files: ", req.member);
        res.render("products");
    } catch (err) {
        console.log("Error: ", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.createNewProduct = async (req: AdminRequest, res: Response) => {
    try {
        console.log("create Prodoct method from productController");
        console.log(req.files)
        if(!req.files?.length){
            throw new Errors(HttpCode.INTERNAL_SERVER_ERROR, Message.CREATE_FAILED);
        }

        // reqning bodysida kelgan imglar arraydan bittalab ovolinayabdi
        const newProduct: ProductInput = req.body;
        newProduct.productImages = req.files?.map((ele)=> {
            return ele.path
        })
 
        // Schema chaqirilayabdi
        await productService.createNewProduct(newProduct);

        // FrontEnd uchun send bolayabdi
        res.send(
            `<script> alert("Product Successfully created"); window.location.replace('/admin/product/all')</script>`
        );
    } catch (err) {
        console.log("Error: ", err);
        const message = err instanceof Errors ? err.message : Message.SOMETHING_WENT_WRONG;
        res.send(
            `<script> alert("${message }"); window.location.replace('/admin/product/all')</script>`
        );
        
    }
};

productController.updateProduct = async (req: Request, res: Response) => {
    try {
        console.log("GetAllProduts method from productController");
    } catch (err) {
        console.log("Error: ", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default productController;