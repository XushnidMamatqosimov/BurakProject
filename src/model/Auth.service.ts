import { AUTH_TIMER } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Member } from "../libs/types/member";
import jwt from "jsonwebtoken";

class AuthService{
    constructor(){

    }

    public async createToken(payload: Member){
        return new Promise((resole, reject)=>{
          const duration = `${AUTH_TIMER}h`;
          jwt.sign(
            payload,
            process.env.SECRET_TOKEN as string,
            {
              expiresIn: duration,
            },
            (err, token)=>{
              if(err){
                reject(new Errors(HttpCode.UNAUTHORIZED, Message.TOKEN_CREATION_FAILED));
              }else{
                resole(token as string);
              }

            }

          );
        });

    }

}

export default AuthService;