import { T } from "../libs/types/common";
import {Request, Response} from "express";
import MemberService  from "../model/Member.service";

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res:Response) => {
    try{
        res.send("homePage");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.goLogin = (req: Request, res:Response) => {
    try{
        res.send("LoginPage");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.processLogin = (req: Request, res:Response) => {
    try{
        res.send("ProcessLogin");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.goSignUp = (req: Request, res:Response) => {
    try{
        res.send("SignUpPage");
    }catch (err){
        console.log("Error: ", err);
    }
};

export default restaurantController;