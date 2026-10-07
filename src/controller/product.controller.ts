import { Request, Response } from "express";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { T } from "../libs/types/common";
import { AdminRequest } from "../libs/types/member";
import { ProductInput } from "../libs/types/product";

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

        const data: ProductInput = req.body;
        data.productImages = req.files?.map((ele)=> {
            return ele.path
        })
        console.log(data);

        res.send("done");
    } catch (err) {
        console.log("Error: ", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
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