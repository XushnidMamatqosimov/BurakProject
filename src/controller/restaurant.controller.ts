import { T } from "../libs/types/common";
import { NextFunction, Request, Response } from "express";
import MemberService from "../model/Member.service";
import { AdminRequest, Member } from "../libs/types/member";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { isRecord, logMemberError, sanitizeMember } from "../libs/utils/member";

const memberService = new MemberService();
const restaurantController: T = {};

async function establishSession(req: AdminRequest, member: Member): Promise<void> {
    delete req.session.member;
    await new Promise<void>((resolve, reject) => {
        req.session.regenerate(error => error ? reject(error) : resolve());
    });
    req.session.member = sanitizeMember(member);
    try {
        await new Promise<void>((resolve, reject) => {
            req.session.save(error => error ? reject(error) : resolve());
        });
    } catch (error) {
        delete req.session.member;
        throw error;
    }
}

function sendAuthError(res: Response, error: unknown, page: "login" | "signup"): void {
    logMemberError(`admin-${page}`, error);
    const message = error instanceof Errors ? error.message : Message.SOMETHING_WENT_WRONG;
    res.send(`<script> alert("${message}"); window.location.replace('/admin/${page}')</script>`);
}

restaurantController.goHome = (req: Request, res: Response) => {
    res.render("home");
};

restaurantController.goLogin = (req: Request, res: Response) => {
    res.render("login");
};

restaurantController.processLogin = async (req: AdminRequest, res: Response) => {
    try {
        const member = await memberService.processLogin(req.body);
        await establishSession(req, member);
        res.redirect("/admin/product/all");
    } catch (error) {
        sendAuthError(res, error, "login");
    }
};

restaurantController.goSignUp = (req: Request, res: Response) => {
    res.render("signup");
};

restaurantController.processSignup = async (req: AdminRequest, res: Response) => {
    try {
        if (!req.file || !isRecord(req.body)) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_INPUT);
        }
        const member = await memberService.processSignup({ ...req.body, memberImage: req.file.path });
        await establishSession(req, member);
        res.redirect("/admin/product/all");
    } catch (error) {
        sendAuthError(res, error, "signup");
    }
};

restaurantController.goLogout = async (req: AdminRequest, res: Response) => {
    try {
        delete req.session.member;
        res.clearCookie("connect.sid");
        await new Promise<void>((resolve, reject) => {
            req.session.destroy(error => error ? reject(error) : resolve());
        });
        res.redirect("/admin");
    } catch (error) {
        logMemberError("admin-logout", error);
        res.status(Errors.standard.code).json(Errors.standard);
    }
};

restaurantController.getUsers = async (req: Request, res: Response) => {
    try {
        const users = await memberService.getUsers();
        res.render("users", { users });
    } catch (error) {
        logMemberError("admin-users", error);
        res.redirect("/admin/login");
    }
};

restaurantController.updateUser = async (req: Request, res: Response) => {
    try {
        const user = await memberService.updateUser(req.body);
        res.status(HttpCode.OK).json({ user });
    } catch (error) {
        logMemberError("admin-update-user", error);
        if (error instanceof Errors) res.status(error.code).json(error);
        else res.status(Errors.standard.code).json(Errors.standard);
    }
};

restaurantController.checkAuthSession = (req: AdminRequest, res: Response) => {
    res.type("text/plain").send(req.session?.member
        ? `Hi, ${req.session.member.memberNick}`
        : Message.NOT_AUTHENTICATED);
};

restaurantController.verifyRestaurant = async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
        const member = await memberService.getRestaurant(req.session?.member?._id);
        if (member) {
            req.member = member;
            req.session.member = member;
            res.locals.member = member;
            next();
            return;
        }
        delete req.member;
        if (req.session) delete req.session.member;
        res.locals.member = undefined;
        res.send(`<script> alert("${Message.NOT_AUTHENTICATED}"); window.location.replace('/admin/login')</script>`);
    } catch (error) {
        delete req.member;
        if (req.session) delete req.session.member;
        res.locals.member = undefined;
        logMemberError("admin-authorization", error);
        res.status(Errors.standard.code).json(Errors.standard);
    }
};

export default restaurantController;
