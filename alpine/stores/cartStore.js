import { cartTotalPrice } from "../utils/api";
import { notify } from "../utils/services";

export default {
  count: 0,
  total: 0,

  init() {
    this.count = parseInt(localStorage.getItem("cartCount")) || 0;
    // this.asyncCartTotal();
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
      const total = await cartTotalPrice();
      this.total = total;
    } catch (error) {
      notify(error, true);
    }
  },
};
