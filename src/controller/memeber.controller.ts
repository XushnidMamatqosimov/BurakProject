import { T } from "../libs/types/common";
import {Request, Response} from "express";
import MemberService from "../model/Member.service";
import MemberInput, { LoginInput, Member } from "../libs/types/member";
import { MemberType } from "../libs/enums/memberTypeEnum";
import Errors from "../libs/Errors";

const memberService = new MemberService();
 
const memberController: T = {};
memberController.signup = async (req: Request, res:Response) => {  
    try{
        console.log("signup by memberController");
        const newMember: MemberInput = req.body;
        const result: Member = await memberService.signup(newMember);
        // Token 
        res.json({member: result});
    }catch (err){
        console.log("Error: ", err);
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
        // res.json({...});
    }
};

memberController.login = async (req: Request, res:Response) => {
    try{
        console.log("Login by memberController")
        const input: LoginInput = req.body;
        const result = await memberService.login(input);
        // token
        res.json({member: result});
    }catch (err){
        console.log("Error: ", err);
        //res.status(500).send(err);
         if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default memberController;