import { shapeIntMogooseObjectId } from "../libs/config";
import { Member } from "../libs/types/member";
import { Order, OrderItemInput } from "../libs/types/order";
import OrderModel from "../schema/Order.model";
import OrderItemModel from "../schema/OrderItem.model";

class OrderService {
  private readonly orderModel;
  private readonly orderItemModel;

  constructor() {
    this.orderModel = OrderModel;
    this.orderItemModel = OrderItemModel;
  }

  // public async createOrder(member: Member, input: OrderItemInput[]): Promise<Order> {
  //   const memberId = shapeIntMogooseObjectId(member._id);
  //   const amount = input.reduce((accumulator: number, item: OrderItemInput) => {
  //     return accumulator + item.itemPrice * item.itemQuantity;
  //   }, 0);
  //   const delivery = amount < 100 ? 5 : 0;

  //   try{
  //     const newOrder: Order = await this.orderModel.create({
  //       orderTotal: amount+delivery,
  //       orderDelivery: delivery,
  //       memberId: memberId
  //     }).exec();

  //   }catch{

  //   }

  // }

}

export default OrderService;
