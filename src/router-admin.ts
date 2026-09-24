import express, { Request, Response } from "express";
const routerAdmin = express.Router();
import restaurantController from "./controller/restaurant.controller";

// Restaurant
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
    .get("/login", restaurantController.goLogin)
    .post("/login", restaurantController.processLogin);  
routerAdmin
    .get("/signup", restaurantController.goSignUp)
    .post("/signup", restaurantController.processSignup);


// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default routerAdmin;