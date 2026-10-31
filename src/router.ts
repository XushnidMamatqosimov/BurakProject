import express, {Request, Response} from "express";
const router = express.Router();
import memberController  from "./controller/memeber.controller";
import uploader from "./libs/utils/uploader";

/** Member **/
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post("/member/logout", 
    memberController.verifyAuth,
    memberController.logout);
router.get("/member/detail", 
    memberController.verifyAuth, 
    memberController.getMemberDetails);
router.post("/member/update", 
    memberController.verifyAuth, 
    uploader("members").single("memberImage"), 
    memberController.updateMember);

/** Product **/

/** Order **/

// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default router;