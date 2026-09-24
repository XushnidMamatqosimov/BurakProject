import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberInput, { Member } from "../libs/types/member";
import MemberModel from "../schema/Member.model";

class MemberService{
    private readonly memberModel;
    constructor(){
        this.memberModel = MemberModel;
    }

    public async processSignup(input: MemberInput): Promise<Member>{
        const exist = await this.memberModel.findOne(input);
        if(exist !== null){
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
        try{
            const result = await this.memberModel.create(input);
            console.log("Came from controller to MemberServic SignUp method");
            return result;
        }catch (err){
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        } 
    }
}

export default MemberService;