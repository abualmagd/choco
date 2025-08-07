import { removeCartItem, updateItemQuatity } from "../utils/api";
import { notify } from "../utils/services";

export default (item) => ({
  quantity: item?.quantity ?? 1,
  product: item?.product ?? null,
  variant: item.variant ?? null,
  id: item?.id ?? 0,

  async icreamentQuantity() {
    console.log("start increament");
    this.quantity = this.quantity + 1;
    try {
      await updateItemQuatity(this.id, this.quantity);
      notify("qauntity updated well");
      this.$store.cart.asyncCartTotal();
    } catch (error) {
      notify(error);
    }
  },

  async decreamentQuantity() {
    if (this.quantity == 1) {
      return null;
    } else {
      this.quantity = this.quantity - 1;
      try {
        await updateItemQuatity(this.id, this.quantity);
        notify("qauntity updated well");
        this.$store.cart.asyncCartTotal();
      } catch (error) {
        notify(error, true);
      }
    }
  },

  async removeItem() {
    try {
      await removeCartItem(item.id);
      notify("item deleted well ");
      this.$store.cart.clearItemCart();
      this.$store.cart.asyncCartTotal();
      setTimeout(window.location.reload(), 4000);
    } catch (error) {
      notify(error, true);
    }
  },

  computeTotal() {
    if (this.product !== null) {
      return this.quantity * this.product.price ?? 0;
    } else {
      return this.quantity * this.variant.price ?? 0;
    }
  },
});
