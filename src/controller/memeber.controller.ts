import { T } from "../libs/types/common";
import {Request, Response} from "express";

const memberController: T = {};
memberController.goHome = (req: Request, res:Response) => {
    try{
        console.log("GoHome");
        res.send("homePage");
    }catch (err){
        console.log("Error: ", err);
    }
};

memberController.goLogin = (req: Request, res:Response) => {
    try{
        console.log("goLogin");
        res.send("LoginPage");
    }catch (err){
        console.log("Error: ", err);
    }
};

memberController.goSignUp = (req: Request, res:Response) => {
    try{
        console.log("goSignUp");
        res.send("SignUpPage");
    }catch (err){
        console.log("Error: ", err);
    }
};

export default memberController;