import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { UserRequest } from "../libs/types/member";
import OrderService from "../model/Order.service";

const orderService = new OrderService();

const orderController: T = {};
orderController.createOrder = async (req: UserRequest, res: Response) => {
  try {
    console.log("CreateOrder controller");
    if (!req.member) throw Errors.standard;
    const order = await orderService.createOrder(req.member, req.body);

    res.status(HttpCode.CREATED).json({order});
  } catch (err) {
    console.log("GetProducts: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
} 

export default orderController;