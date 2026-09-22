import express, { urlencoded } from "express";
import { url } from "inspector";
import path from "path";
import router from "./router";


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
app.use("/", router);    //Middileware design pattern



export default app;