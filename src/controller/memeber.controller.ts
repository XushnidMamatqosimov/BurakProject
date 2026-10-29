import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../model/Member.service";
import Errors from "../libs/Errors";
import { logMemberError } from "../libs/utils/member";
import AuthService from "../model/Auth.service";

const memberService = new MemberService();
const authService = new AuthService();
const memberController: T = {};

memberController.signup = async (req: Request, res: Response) => {
    try {
        const member = await memberService.signup(req.body);
        const resToken = await authService.createToken(member);
        console.log("signUp Token: ", resToken);
        // TOKENS AUTHENTICATION
        res.json({ member });
    } catch (error) {
        logMemberError("member-signup", error);
        if (error instanceof Errors) res.status(error.code).json(error);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

memberController.login = async (req: Request, res: Response) => {
    try {
        const member = await memberService.login(req.body);
        res.json({ member });
        const token = await authService.createToken(member);
        console.log("Token: ", token);
        // Token Authentication
    } catch (error) {
        logMemberError("member-login", error);
        if (error instanceof Errors) res.status(error.code).json(error);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default memberController;
