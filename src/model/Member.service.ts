import { MemberType } from "../libs/enums/memberTypeEnum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberInput, { LoginInput, Member } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";

class MemberService {
    private readonly memberModel;
    constructor() {
        this.memberModel = MemberModel;
    }

    /* SPA */

    public async signup(input: MemberInput): Promise<Member> {
        const salt = await bcrypt.genSalt();
        console.log("member password: ", input.memberPassword);
        input.memberPassword = await bcrypt.hash(input.memberPassword, salt);

        try {
            const result = await this.memberModel.create(input);
            result.memberPassword = "";
            return result.toJSON();
        } catch (err) {
            console.log("Error occured on SPA signUp Sevice", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }

    public async login(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne({ memberNick: input.memberNick },
                { _id: 1, memberNick: 1, memberPassword: 1 }
            ).select("+memberPassword")
            .exec();

        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }

        const isMatch = await bcrypt.compare(
            input.memberPassword,
            member.memberPassword);

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        return await this.memberModel.findById(member._id).lean().exec();
    }



    /* SSR */
    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel.findOne(input);
        if(exist && exist.memberType === MemberType.RESTAURANT) 
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        try {
            const salt = await bcrypt.genSalt();
            input.memberPassword = await bcrypt.hash(input.memberPassword, salt);
            const result = await this.memberModel.create(input);
            console.log("Came from controller to MemberServic SignUp method");
            return result;
        } catch (err) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async processLogin(input: LoginInput): Promise<Member> {
        const member = await this.memberModel
            .findOne({ memberNick: input.memberNick },
                { _id: 1, memberNick: 1, memberPassword: 1 }
            ).select("+memberPassword")
            .exec();

        if (!member) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }

        console.log("MEMBER:", member);
        console.log("INPUT PASSWORD:", input.memberPassword);
        console.log("DB PASSWORD:", member.memberPassword);

        const isMatch = await bcrypt.compare(
            input.memberPassword,
            member.memberPassword);

        if (!isMatch) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        return await this.memberModel.findById(member._id).exec();
    }

    public async getUsers(): Promise<Member[]> {
        const result = await this.memberModel.find({memberType: MemberType.USER}).exec();
        if(!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }
}

export default MemberService;