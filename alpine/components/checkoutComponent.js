import { updateOrderById } from "../utils/api";

export default (order) => ({
  id: order.id,
  shipping: order.shipping ?? "0",
  discount: order.discount ?? "0",
  addresses: order.user.addresses,
  phone: order.phone,
  shippingAddressId: order.shippingAddressId,
  paymentMethod: order.paymentMethod ?? null,
  shippingMethod: order.shippingMethod ?? null,

  async updateMyOrder() {
    console.log(this.paymentMethod);
    await updateOrderById(this.id, {
      phone: this.phone,
      shippingAddressId: this.shippingAddressId,
      paymentMethod: this.paymentMethod,
      shippingMethod: this.shippingMethod,
    });
  },

  butterifyAddress(address) {
    return (
      address.country +
      ", " +
      address.city +
      ", " +
      address.street +
      ", " +
      address.state
    );
  },

  updadteUserAdresses() {
    window.location.reload();
  },
});
