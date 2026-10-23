import { Request } from "express";
import { Types } from "mongoose";
import { Session } from "express-session";
import { MemberStatus, MemberType } from "../enums/memberTypeEnum";


// DTO malumotlarni tashib yuradi
export interface Member{
    _id: Types.ObjectId | string;
    memberNick: string;
    memberPhone: string;
    memberPassword?: string;
    memberType: MemberType;
    memberStatus: MemberStatus;
    memberAddress: string;
    memberDesc?: string;
    memberImage?: string;
    memberPoints: number;
    createdAt: Date;
    updatedAt: Date;

}


// DTO databasega malumotni tashib oborib beradi
export interface MemberInput{
    memberNick: string;
    memberPhone: string;
    memberPassword: string;
    memberType?: MemberType;
    memberStatus?: MemberStatus;
    memberAddress?: string;
    memberDesc?: string;
    memberImage?: string;
    memberPoints?: number;

}
export interface MemberUpdateInput{
    _id: string;
    memberStatus: MemberStatus;
}

export interface LoginInput{
    memberNick: string;
    memberPassword: string; 
}

export interface AdminRequest extends Request {
    member?: Omit<Member, "memberPassword">;
    session: Session & {member?: Omit<Member, "memberPassword">};
    file: Express.Multer.File;
    files: Express.Multer.File[];

}

export default MemberInput;
