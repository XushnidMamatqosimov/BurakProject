import {ObjectId} from "mongoose";
import { ViewGroup } from "../enums/viewEnum";

// Bu bizda DTO class kabi malumot tashib yurish uchun ekan;
export interface View {
    _id: ObjectId;
    viewGroup: ViewGroup;
    memberId: ObjectId;
    viewRefId: ObjectId;
    createdAt: Date;
    updatedAt: Date;
    
}

// DTO => userdan kirib kelgan malumotlarni controllerda ushlab olishga kk
export interface ViewInput {
    memberId: ObjectId;
    viewGroup: ViewGroup;
    viewRefId: ObjectId;
    
}