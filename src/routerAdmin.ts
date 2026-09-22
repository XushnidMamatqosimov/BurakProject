import express, {Request, Response} from "express";
const router = express.Router();
import memberController  from "./controller/restaurant.controller";

router.get("/", memberController.goHome);

router.get("/login", memberController.goLogin);

router.get("/signup", memberController.goSignUp);


// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default router;