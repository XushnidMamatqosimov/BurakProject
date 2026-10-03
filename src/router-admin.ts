import express, { Request, Response } from "express";
const routerAdmin = express.Router();
import restaurantController from "./controller/restaurant.controller";
import productController from "./controller/product.controller";
import makeUploader, {  } from "./libs/utils/uploader";

// Restaurant
routerAdmin.get("/", restaurantController.goHome);
routerAdmin
    .get("/login", restaurantController.goLogin)
    .post("/login", restaurantController.processLogin);  
routerAdmin
    .get("/signup", restaurantController.goSignUp)
    .post("/signup", makeUploader("member").single("memberImage "), restaurantController.processSignup);
    
routerAdmin.get("/logout", restaurantController.goLogout);    
routerAdmin.get("/check-me", restaurantController.checkAuthSession); 

// Products
routerAdmin.get("/product/all", restaurantController.verifyRestaurant, productController.getAllProducts);
routerAdmin.get("/product/create", 
    restaurantController.verifyRestaurant,
    productController.createNewProduct,
    makeUploader("products")
    .single("productImage"));
routerAdmin.get("/product/:id",restaurantController.verifyRestaurant, productController.updateProduct);




// DI - dependency injection uchun Bean yasab Savatchaga joylash
export default routerAdmin;