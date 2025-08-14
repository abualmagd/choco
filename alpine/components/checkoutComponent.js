import { updateOrderById } from "../utils/api";

export default (order) => ({
  id: order.id,
  paymentMethod: order.paymentMethod ?? "Card",
  shipping: order.shipping ?? "0",
  discount: order.discount ?? "0",
  addresses: order.user.addresses,
  shippingAddressId: order.shippingAddressId,
  paymentMethod: null,
  shippingMethod: null,

  async updateOrderAddress(shippingAddressId) {
    await updateOrderById(this.id, {
      shippingAddressId: shippingAddressId,
    });
    this.shippingAddressId = shippingAddressId;
  },
  async updatePaymentMethod(paymentMethod) {
    //updateOrder
    await updateOrderById(this.id, {
      paymentMethod: paymentMethod,
    });
    this.paymentMethod = paymentMethod;
  },
  async updateShippingMethod(shippingMethod) {
    //updateOrder
    console.log("shipp: ", shippingMethod);
    await updateOrderById(this.id, {
      shippingMethod: shippingMethod,
    });
    this.paymentMethod = paymentMethod;
  },

  updadteUserAdresses() {
    window.location.reload();
  },
});
