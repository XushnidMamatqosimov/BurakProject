import { shapeIntMogooseObjectId } from "../libs/config";
import Errors, { HttpCode } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderItemInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { Message } from "../libs/Errors";
import { ObjectId } from "mongoose";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
  }

  public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
    const memberId = shapeIntMogooseObjectId(member._id);
    const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
      return accumulator + item.itemPrice * item.itemQuantity;
    }, 0);
    const delivery = amount < 100 ? 5 : 0;

    try {
      const newOrder: Order = await this.orderModel.create({
        orderTotal: amount + delivery,
        orderDelivery: delivery,
        memberId: memberId,
      });

      const orderId = newOrder._id;
      // TODO: create order items;
      await this.recordOrderItem(orderId, input);
      return newOrder;
    } catch (err) {
      console.log("Error create Ordermodel: ", err);
      throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED);
    }
  }

  private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]): Promise<void>{
    const promisedList = input.map(async(item: OrderItemInput) => {
      item.orderId = orderId;
      item.productId = shapeIntMogooseObjectId(item.productId);
      await this.orderItemModel.create(item);
      return "Inserted";
    });

    console.log("promisedList: ", promisedList);
    const orderItemsState = await Promise.all(promisedList);
    console.log("orderItemsState: ", orderItemsState);
  } 
}

export default OrderService;
