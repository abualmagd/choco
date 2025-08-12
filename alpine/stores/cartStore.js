import { cartTotalPrice } from "../utils/api";
import { notify } from "../utils/services";

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
    this.count = parseInt(this.count) - 1;
    localStorage.setItem("cartCount", this.count);
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
