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


// Entity databasega malumotni tashib oborib beradi
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

export default MemberInput;