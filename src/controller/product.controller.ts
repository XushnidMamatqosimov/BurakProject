import { Request, Response } from "express";
import Errors from "../libs/Errors";
import { T } from "../libs/types/common";
import { AdminRequest } from "../libs/types/member";

const productController: T = {};

productController.getAllProducts = async (req: AdminRequest, res: Response) => {
    try {
        console.log("GetAllProduts method from productController");
        console.log(req.member);
        res.render("products");
    } catch (err) {
        console.log("Error: ", err);
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

productController.createNewProduct = async (req: Request, res: Response) => {
    try {
        console.log("GetAllProduts method from productController");
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