import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../model/Member.service";
import MemberInput, { AdminRequest, LoginInput } from "../libs/types/member";
import { MemberType } from "../libs/enums/memberTypeEnum";
import session from "express-session";
import Errors, { HttpCode, Message } from "../libs/Errors";

const memberService = new MemberService();

const restaurantController: T = {};
restaurantController.goHome = (req: Request, res: Response) => {
    try {
        console.log("goHome from restarantController");
        res.render("home");
    } catch (err) {
        console.log("Error: ", err);
    }
};

restaurantController.goLogin = (req: Request, res: Response) => {
    try {
        res.render("login");
    } catch (err) {
        console.log("Error: ", err);
    }
};

restaurantController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        console.log("Process Login, processLogin")
        const input: LoginInput = req.body;
        const login = await memberService.processLogin(input);

        // sessions authentication
        req.session.member = login;
        req.session.save(function () {
            res.redirect("/admin/product/all");
        });

    } catch (err) {
        console.log("Error: ", err);
        res.redirect("/admin/login")
        res.status(500).send(err);
    }
};

restaurantController.goSignUp = (req: Request, res: Response) => {
    try {
        res.render("signup");
    } catch (err) {
        console.log("Error: ", err);
    }
};

restaurantController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        console.log("processSignUp");
        const file = req.file;
        if(!file){
            throw new Errors(HttpCode.BAD_REQUEST, Message.SOMETHING_WENT_WRONG);
        }
        const newMember: MemberInput = req.body;
        newMember.memberImage = file?.path;
        newMember.memberType = MemberType.RESTAURANT;
        const signUp = await memberService.processSignup(newMember);

        // sessions authentication
        req.session.member = signUp;
        req.session.save(function () {
            res.redirect("/admin/product/all");
        });

    } catch (err) {
        console.log("Error: ", err);
        res.redirect("/admin/signup");
    }
};

restaurantController.goLogout = async (req: AdminRequest, res: Response) => {
    try {
        console.log("Logout from restController");
        req.session.destroy(function () {
            res.redirect("/admin")
        })
    } catch (err) {
        console.log("Error: ", err);
    }
}

restaurantController.getUsers = async(req: Request, res: Response) => {
    try {
       console.log("Get Users from restauranController[getUsers] method");
      const users = await memberService.getUsers();
      console.log("users: ", users)
      res.render("user", {users: users});
    } catch (err) {
        console.log("Error: ", err);
        res.redirect("/admin/login");
    }
};

restaurantController.updateUser = async (req: Request, res: Response) => {
    try {
       console.log("Get Users from restauranController[updateUser] method");
       const user =  await memberService.updateUser(req.body);
       res.status(HttpCode.OK).json({user: user});
    } catch (err) {
        console.log("Error updateUserMethod: ", err);
        if(err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

restaurantController.checkAuthSession = async (req: AdminRequest, res: Response) => {
    try {
        console.log("checkAuthSession method from restaurantController");
        if (req.session?.member) {
            res.send(`Hi, ${req.session.member.memberNick}`);
        } else {
            res.send(Message.NOT_AUTHENTICATED);
        }
    } catch (err) {
        console.log("Error, checkAuthentication", err);
    }
};

restaurantController.verifyRestaurant = async (req: AdminRequest, res: Response, next: NextFunction) => {

   if (req.session?.member?.memberType === MemberType.RESTAURANT) {
        req.member = req.session.member;
        next();
    } else {
        const message = Message.NOT_AUTHENTICATED;
        res.send(`<script> alert("${message}"); window.location.replace('/admin/login')</script>`);
    }
}

export default restaurantController;