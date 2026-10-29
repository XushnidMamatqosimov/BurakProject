import express, {Request, Response} from "express";
const router = express.Router();
import memberController  from "./controller/memeber.controller";

/** Member **/
router.post("/member/login", memberController.login);
router.post("/member/signup", memberController.signup);
router.post("/member/logout", memberController.verifyAuth, memberController.logout);
router.get("/member/detail", memberController.verifyAuth, memberController.getMemberDetails);

/** Product **/

/** Order **/

// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default router;