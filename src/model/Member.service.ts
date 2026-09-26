import Errors, { HttpCode, Message } from "../libs/Errors";
import MemberInput, { LoginInput, Member } from "../libs/types/member";
import MemberModel from "../schema/Member.model";
import * as bcrypt from "bcryptjs";

class MemberService {
    private readonly memberModel;
    constructor() {
        this.memberModel = MemberModel;
    }

    public async processSignup(input: MemberInput): Promise<Member> {
        const exist = await this.memberModel.findOne(input);
        if (exist !== null) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
        }
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
            .findOne({ memberNick: input.memberNick}, 
                {_id: 1,  memberNick: 1, memberPassword: 1}
            )
            .exec();

        if (!member ){
            throw new Errors(HttpCode.NOT_FOUND, Message.NO_MEMBER_NICK  );
        }

        const isMatch = await bcrypt.compare(input.memberPassword, member.memberPassword);

        const passwordIsMatch = member.memberPassword === input.memberPassword;
        console.log(passwordIsMatch);
        if(!passwordIsMatch){
            throw new Errors(HttpCode.UNAUTHORIZED, Message.WRONG_PASSWORD);
        }

        return await this.memberModel.findById(member._id).exec();
    }
}

export default MemberService;