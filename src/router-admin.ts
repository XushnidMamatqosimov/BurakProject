import express, { Request, Response } from "express";
const routerAdmin = express.Router();
import restaurantController from "./controller/restaurant.controller";
import productController from "./controller/product.controller";

// Restaurant
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
    .get("/login", restaurantController.goLogin)
    .post("/login", restaurantController.processLogin);  
routerAdmin
    .get("/signup", restaurantController.goSignUp)
    .post("/signup", restaurantController.processSignup);
    
routerAdmin.get("/logout", restaurantController.goLogout);    
routerAdmin.get("/check-me", restaurantController.checkAuthSession); 

// Products
routerAdmin.get("/product/all", restaurantController.verifyRestaurant, productController.getAllProducts);
routerAdmin.get("/product/create", restaurantController.verifyRestaurant, productController.createNewProduct);
routerAdmin.get("/product/:id",restaurantController.verifyRestaurant, productController.updateProduct);




// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default routerAdmin;