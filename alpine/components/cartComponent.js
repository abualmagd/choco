import { addToCartApi } from "../utils/api";
import { notify } from "../utils/services";

export default (productId) => ({
  count: 1,
  size: 8,
  color: "yellow",
  isLoading: false,
  error: null,
  productId: productId,

  async addToCart() {
    this.isLoading = true;
    try {
      await addToCartApi({
        productId: this.productId,
        qauntity: this.count,
      });

      Alpine.store("cart").updateCart();
      notify(" product added to your cart");
      this.isLoading = false;
    } catch (error) {
      this.error = error;
      this.isLoading = false;
    } finally {
      this.isLoading = false;
    }
  },
  async buyNow() {
    this.addToCart();
    setTimeout(() => {
      window.location.replace("/cart");
    }, 3000);
  },
});
