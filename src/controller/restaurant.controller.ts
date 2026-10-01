import { T } from "../libs/types/common";
import {Request, Response} from "express";
import MemberService  from "../model/Member.service";
import MemberInput, { LoginInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/memberTypeEnum";

const memberService = new MemberService();

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
        res.send("LoginPage GoLign");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.processLogin = async (req: Request, res:Response) => {
    try{
        console.log("Process Login, processLogin")
        const input: LoginInput = req.body;
        const result = await memberService.processLogin(input);
        // sessions
        res.send(result);
    }catch (err){
        console.log("Error: ", err);
        res.status(500).send(err);
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
        const newMember: MemberInput = req.body;
        newMember.memberType = MemberType.RESTAURANT;
        const result = await memberService.processSignup(newMember);
        // sessions
        res.send(result);
    }catch (err){
        console.log("Error: ", err);
    }
};

export default restaurantController;