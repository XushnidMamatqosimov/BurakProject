import { T } from "../libs/types/common";
import {Request, Response} from "express";
import MemberService  from "../model/Member.service";
import MemberInput, { AdminRequest, LoginInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/memberTypeEnum";
import session from "express-session";
import { Message } from "../libs/Errors";

const memberService = new MemberService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res:Response) => {
    try{
        console.log("goHome from restarantController");
        res.render("home");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.goLogin = (req: Request, res:Response) => {
    try{
        res.render("login");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.processLogin = async (req: AdminRequest, res:Response) => {
    try{
        console.log("Process Login, processLogin")
        const input: LoginInput = req.body;
        const login = await memberService.processLogin(input);

       // sessions authentication
       req.session.member = login;
       req.session.save( function () {
            res.send(login);
       });

    }catch (err){
        console.log("Error: ", err);
        res.status(500).send(err);
    }
};

restaurantController.goSignUp = (req: Request, res:Response) => {
    try{
        res.render("signup");
    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.processSignup = async (req: AdminRequest, res:Response) => {  
    try{
        console.log("processSignUp");
        const newMember: MemberInput = req.body;
        newMember.memberType = MemberType.RESTAURANT;
        const signUp = await memberService.processSignup(newMember);

        // sessions authentication
        req.session.member = signUp;
        req.session.save(function() {
            res.send(signUp);
        });

    }catch (err){
        console.log("Error: ", err);
    }
};

restaurantController.checkAuthSession = async (req: AdminRequest, res:Response) => {  
    try{
        console.log("checkAuthSession method from restaurantController");
        if (req.session?.member) {
            res.send(`Hi, ${req.session.member.memberNick}`);
        } else {
            res.send(Message.NOT_AUTHENTICATED);
        }
    }catch (err){
        console.log("Error, checkAuthentication", err);
    }
};

export default restaurantController;