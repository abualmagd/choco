export default (user, order) => ({
  paymentMethod: order.paymentMethod ?? "none",
  orderNumber: order.orderNumber ?? "orderNumber",
  subtotal: order.subtotal ?? "0",
  tax: order.tax ?? "0",
  shipping: order.shipping ?? "0",
  discount: order.discount ?? "0",
  total: order.total ?? "0",
  addresses: user.addresses,
});
