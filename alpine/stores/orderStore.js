import { createOrder } from "../utils/api";
import {
  convertCartItemToOrderItem,
  generatRandomNumber,
  notify,
} from "../utils/services";

export default {
  updateOrder() {
    console.log("order items: ", generatRandomNumber());
  },

  async createUserOrder(cart) {
    try {
      const orderItems = cart.items.map((item) => {
        return convertCartItemToOrderItem(item);
      });

      //console.log("order creating: start");
      const r = generatRandomNumber();
      const data = {
        paymentMethod: "",
        orderNumber: r,
        subtotal: Alpine.store("cart").total,
        tax: "0",
        shipping: "0",
        discount: Alpine.store("cart").discount,
        total: Alpine.store("cart").total,
        items: orderItems,
      };

      const order = await createOrder(data);
      window.location.replace("/checkout/" + order.id);
    } catch (error) {
      console.log("error", error);
      notify(String(error), true);
    }
  },
};
