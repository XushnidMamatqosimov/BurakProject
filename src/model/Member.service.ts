import { Types } from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/memberTypeEnum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import {
    buildMemberInput, invalidInput, isMemberId, isRecord,
    sanitizeMember, validateLoginInput,
} from "../libs/utils/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";

class MemberService {
    private readonly memberModel;
    constructor() {
        this.memberModel = MemberModel;
    }

    /* SPA */
    public async signup(input: unknown): Promise<Member> {
        const newMember = buildMemberInput(input, MemberType.USER);
        const salt = await bcrypt.genSalt();
        newMember.memberPassword = await bcrypt.hash(newMember.memberPassword, salt);
        try {
            const result = await this.memberModel.create(newMember);
            return { ...sanitizeMember(result.toObject()), memberPassword: "" };
        } catch {
            throw new Errors(HttpCode.BAD_REQUEST, Message.USED_NICK_PHONE);
        }
    }

    public async login(input: unknown): Promise<Member> {
        const credentials = validateLoginInput(input);
        const member = await this.memberModel.findOne({
            memberNick: credentials.memberNick,
            memberStatus: { $ne: MemberStatus.DELETED },
        }).select("+memberPassword").exec();

        if (!member) throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDIN, Message.BLOCKED_USER);
        }
        if (!await bcrypt.compare(credentials.memberPassword, member.memberPassword)) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        return sanitizeMember(member.toObject());
    }

    /* SSR */
    public async processSignup(input: unknown): Promise<Member> {
        const newMember = buildMemberInput(input, MemberType.RESTAURANT);
        const exist = await this.memberModel.findOne({ memberType: MemberType.RESTAURANT }).exec();
        if (exist) throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        const salt = await bcrypt.genSalt();
        newMember.memberPassword = await bcrypt.hash(newMember.memberPassword, salt);
        try {
            const result = await this.memberModel.create(newMember);
            return sanitizeMember(result.toObject());
        } catch {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
    }

    public async processLogin(input: unknown): Promise<Member> {
        const credentials = validateLoginInput(input);
        const member = await this.memberModel.findOne({
            memberNick: credentials.memberNick,
        }).select("+memberPassword").exec();

        if (!member || member.memberStatus === MemberStatus.DELETED) {
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK);
        }
        if (member.memberStatus === MemberStatus.BLOCK) {
            throw new Errors(HttpCode.FORBIDDIN, Message.BLOCKED_USER);
        }
        if (!await bcrypt.compare(credentials.memberPassword, member.memberPassword)) {
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }
        if (member.memberType !== MemberType.RESTAURANT || member.memberStatus !== MemberStatus.ACTIVE) {
            throw new Errors(HttpCode.FORBIDDIN, Message.NOT_AUTHENTICATED);
        }
        return sanitizeMember(member.toObject());
    }

    public async getRestaurant(id: unknown): Promise<Member | null> {
        const memberId = id instanceof Types.ObjectId ? id.toHexString() : id;
        if (!isMemberId(memberId)) return null;
        const member = await this.memberModel.findById(memberId).exec();
        if (!member || member.memberType !== MemberType.RESTAURANT ||
            member.memberStatus !== MemberStatus.ACTIVE) return null;
        return sanitizeMember(member.toObject());
    }

    public async getUsers(): Promise<Member[]> {
        const result = await this.memberModel.find({ memberType: MemberType.USER }).exec();
        return result.map(member => sanitizeMember(member.toObject()));
    }

    public async updateUser(input: unknown): Promise<Member> {
        if (!isRecord(input) || Object.keys(input).length !== 2 ||
            !Object.prototype.hasOwnProperty.call(input, "_id") ||
            !Object.prototype.hasOwnProperty.call(input, "memberStatus") ||
            !isMemberId(input._id) ||
            !Object.values(MemberStatus).some(status => status === input.memberStatus)) {
            throw invalidInput();
        }
        const result = await this.memberModel.findOneAndUpdate(
            { _id: new Types.ObjectId(input._id), memberType: MemberType.USER },
            { $set: { memberStatus: input.memberStatus } },
            { new: true, runValidators: true },
        ).exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return sanitizeMember(result.toObject());
    }
}

export default MemberService;
