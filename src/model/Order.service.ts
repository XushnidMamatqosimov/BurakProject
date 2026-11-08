import { shapeIntMogooseObjectId } from "../libs/config";
import Errors, { HttpCode } from "../libs/Errors";
import { Member } from "../libs/types/member";
import { Order, OrderInquiry, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";
import { Message } from "../libs/Errors";
import { ObjectId } from "mongoose";
import { OrderStatus } from "../libs/enums/orderEnum";
import MemberService from "./Member.service";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;
  private readonly memberService;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
    this.memberService = new MemberService();
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

  public async getMyOrders(member: Member, inquiry: OrderInquiry): Promise<Order[]> {
    const memberId = shapeIntMogooseObjectId(member._id);
    const maches = { memberId: memberId, orderStatus: inquiry.orderStatus }

    const result = await this.orderModel.aggregate([
      { $match: maches },
      { $sort: { updatedAt: -1 } },
      { $skip: (inquiry.page - 1) * inquiry.limit },
      { $limit: inquiry.limit },
      {
        $lookup: {
          from: "oderItems",
          localField: "_id",
          foreignField: "orderId",
          as: "orderItems",
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "orderItems.productId",
          foreignField: "_id",
          as: "productData",
        },
      },
    ]).exec();
    if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
    return result;
  }

  public async updateOrder(member: Member, input: OrderUpdateInput): Promise<Order> {
    const memberId = shapeIntMogooseObjectId(member._id);
    const orderId = shapeIntMogooseObjectId(input.orderId);
    const orderStatus = input.orderStatus;

    const result = await this.orderModel.findOneAndUpdate(
      {
        memberId: memberId,
        _id: orderId,
      },
      {orderStatus: orderStatus}, {new: true}
    ).exec();
    if(!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

    if(result.orderStatus === OrderStatus.PROCESS){
      await this.memberService.addUserPoint(member, 1);

    }
    return result; 
   
  }

  private async recordOrderItem(orderId: ObjectId, input: OrderItemInput[]): Promise<void> {
    const promisedList = input.map(async (item: OrderItemInput) => {
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
