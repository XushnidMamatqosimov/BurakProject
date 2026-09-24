import { T } from "../libs/types/common";
import {Request, Response} from "express";
import MemberService  from "../model/Member.service";
import MemberInput from "../libs/types/member";
import { MemberType } from "../libs/enums/memberTypeEnum";

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

restaurantController.processSignup = async (req: Request, res:Response) => {
        
    try{
        console.log("processSignUp");
        console.log("body: ", req.body );

        const newMember: MemberInput = req.body;
        newMember.memberType = MemberType.RESTAURANT;

        const memberService = new MemberService();
        const result = await memberService.processSignup(newMember);
        res.send(result);
    }catch (err){
        console.log("Error: ", err);
    }
};

export default restaurantController;