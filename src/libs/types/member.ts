import { Request } from "express";
import { ObjectId} from "mongoose";
import { Session, SessionData } from "express-session";
import { MemberStatus, MemberType } from "../enums/memberTypeEnum";


// DTO malumotlarni tashib yuradi
export interface Member{
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
    _id: ObjectId;
    memberNick?: string;
    memberPhone?: string;
    memberPassword?: string;
    memberStatus?: MemberStatus;
    memberAddress?: string;
    memberDesc?: string;
    memberImage?: string;
}

export interface LoginInput{
    memberNick: string;
    memberPassword: string; 
}

export interface AdminRequest extends Request {
    member: Member,
    session: Session & {member: Member};
    file: Express.Multer.File;
    files: Express.Multer.File[];

}

export default MemberInput;