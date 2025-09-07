import { cartTotalPrice, removeAllCartItem } from "../utils/api";

export default {
  count: 0,
  total: 0,
  discount: 0,

  init() {
    this.count = parseInt(localStorage.getItem("cartCount")) || 0;
    if (this.count !== 0) {
      this.asyncCartTotal();
    }
  },

  updateCart() {
    this.count = parseInt(this.count) + 1;
    localStorage.setItem("cartCount", this.count);
  },

  clearItemCart() {
    if (this.count !== 0) this.count = parseInt(this.count) - 1;
    localStorage.setItem("cartCount", this.count);
  },
  async clearCart() {
    this.count = 0;
    await removeAllCartItem();
    localStorage.setItem("cartCount", 0);
  },
  async asyncCartTotal() {
    try {
      const data = await cartTotalPrice();
      this.total = data.total;
      this.discount = data.discount;
    } catch (error) {
      // notify(error, true);
    }
  },
};
