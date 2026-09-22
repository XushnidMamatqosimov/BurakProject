import express, { urlencoded } from "express";
import { url } from "inspector";
import path from "path";
import router from "./router";
import routerAdmin from "./routerAdmin";


//  1-Entrence
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

//  2-Sessions

//  3-Views

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//  4-Route
app.use("/admin", routerAdmin);  // BSSR => EJS 
app.use("/", router);   // SPA =>  React



export default app;