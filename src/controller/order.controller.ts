import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { UserRequest } from "../libs/types/member";
import OrderService from "../model/Order.service";
import { OrderInquiry, OrderUpdateInput } from "../libs/types/order";
import { OrderStatus } from "../libs/enums/orderEnum";

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

orderController.getMyOrders = async (req: UserRequest, res: Response) => {
  try {
    console.log("getMyOrders controller");
    if (!req.member) throw Errors.standard;
    const {page, limit, orderStatus } = req.query;
    const inquiry: OrderInquiry = {
      page: Number(page),
      limit: Number(limit),
      orderStatus: orderStatus as OrderStatus
    }
    console.log("inquiry: ", inquiry);

   const ordersList = await orderService.getMyOrders(req.member, inquiry);

    res.status(HttpCode.OK).json({ordersList});
  } catch (err) {
    console.log("GetMyOrders: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
} 

orderController.updateOrder = async (req: UserRequest, res: Response) => {
  try {
    console.log("UpdateOrder controller");
    if (!req.member) throw Errors.standard;
    const input: OrderUpdateInput = req.body;
    const updatedOrder = await orderService.updateOrder(req.member, input);
    console.log("updateedOrder: ", updatedOrder);

    res.status(HttpCode.OK).json({updatedOrder});
  } catch (err) {
    console.log("updateOrder: ", err);
    if (err instanceof Errors) res.status(err.code).json(err);
    else res.status(Errors.standard.code).json(Errors.standard);
  }
} 



export default orderController;