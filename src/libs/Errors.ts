export enum HttpCode{
    OK = 200,
    CREATED = 201,
    NOT_MODIFIED = 304,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDIN = 403,
    NOT_FOUND = 404,
    INTERNAL_SERVER_ERROR = 500,

}

export enum Message {
    SOMETHING_WENT_WRONG = "Something went wrong!",
    NO_DATA_FOUND = "No data is found!",
    CREATE_FAILED = "Create is failed",
    UPDATE_FAILED = "Update is failed",

    NO_MEMBER_NICK = "No member find with this nickname",
    USED_MEMBER_NIKC ="Used NickName",
    USED_NICK_PHONE = "Your are using already used phone or nickname",
    WRONG_PASSWORD = "Password is wrong",
    NOT_AUTHENTICATED = "You are not authenticated, Please login first",
}

class Errors extends Error{
    public code: HttpCode;
    public message: Message;

    static standard ={
        code: HttpCode.INTERNAL_SERVER_ERROR,
        message: Message.SOMETHING_WENT_WRONG
    };

    constructor(statusCode: HttpCode, statusMessage: Message){
        super();
        this.code = statusCode, 
        this.message = statusMessage;
    };
}

export default Errors;