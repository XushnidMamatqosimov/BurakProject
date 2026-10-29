import { T } from "../libs/types/common";
import { Request, Response } from "express";
import MemberService from "../model/Member.service";
import Errors, { HttpCode } from "../libs/Errors";
import { logMemberError } from "../libs/utils/member";
import AuthService from "../model/Auth.service";
import { AUTH_TIMER } from "../libs/config";

const memberService = new MemberService();
const authService = new AuthService();
const memberController: T = {};

memberController.signup = async (req: Request, res: Response) => {
  try {
    const member = await memberService.signup(req.body);

    // TOKENS AUTHENTICATION
    const resToken = await authService.createToken(member);
    console.log("signUp Token: ", resToken);
    
    res.cookie("accessToken", resToken, {
      maxAge: AUTH_TIMER*3600*1000,
      httpOnly: false,
    });
    res.status(HttpCode.CREATED).json({ member: member, accessToken: resToken });
  } catch (error) {
    logMemberError("member-signup", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

memberController.login = async (req: Request, res: Response) => {
  try {
    const member = await memberService.login(req.body);

    // Token Authentication
    const token = await authService.createToken(member);

    res.cookie("accessToken", token, {
      maxAge: AUTH_TIMER*3600*1000,
      httpOnly: false,
    });
    console.log("Token: ", token);
    res.status(HttpCode.OK).json({ member: member, accessToken: token });
  } catch (error) {
    logMemberError("member-login", error);
    if (error instanceof Errors) res.status(error.code).json(error);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
};

export default memberController;
