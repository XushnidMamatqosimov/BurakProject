import mongoose, {Schema} from "mongoose";
import { MemberStatus, MemberType } from "../libs/enums/memberTypeEnum";

const memberSchema = new Schema({
    memberType: {
        type: String,
        enum: MemberType,
        default: MemberType.USER
    },

    memberStatus: {
        type: String,
        enum: MemberStatus,
        default: MemberStatus.ACTIVE
    },

    memberNick: {
        type: String,
        index: {unique: true, sparse: true},
        required: true
    },

    memberPhone: {
        type: String,
        index: {unique:true, sparse: true },
        required: true
    },

    memberPassowrd: {
        type: String,
        select: false,
        require: true
    },

    memberAddress: {
        type: String
    },

    memberDesc: {
        type: String
    },

    memberImg: {
        type: String
    },

    memberPoints: {
        type: Number,
        default: 0
    },
},  {timestamps: true} // updatedAt and createdAt
);


export default mongoose.model("Member", memberSchema);