import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../model/Member.service";
import Errors from "../libs/Errors";
import { logMemberError } from "../libs/utils/member";

const memberService = new MemberService();
const memberController: T = {};

memberController.signup = async (req: Request, res: Response) => {
    try {
        const member = await memberService.signup(req.body);
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
    } catch (error) {
        logMemberError("member-login", error);
        if (error instanceof Errors) res.status(error.code).json(error);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default memberController;
