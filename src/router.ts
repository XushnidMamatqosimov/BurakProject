import express, {Request, Response} from "express";
const router = express.Router();
import memberController  from "./controller/memeber.controller";

router.post("/login", memberController.login);

router.post("/signup", memberController.signup);

// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default router;