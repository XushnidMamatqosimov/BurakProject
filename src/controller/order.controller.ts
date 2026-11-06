import { Response } from "express";
import Errors from "../libs/Errors";
import { T } from "../libs/types/common";
import { UserRequest } from "../libs/types/member";
import OrderService from "../model/Order.service";

const orderService = new OrderService();

const orderController: T = {};
/* orderController.createOrder = async (req: UserRequest, res: Response) => {
  try {
    console.log("CreateOrder controller");
    const order = await orderService.createOrder(req.member, req.body);

  } catch (err) {
    console.log("GetProducts: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }

} */

export default orderController;