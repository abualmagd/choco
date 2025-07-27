window.itemCartComponent = (item) => ({
  quantity: item?.quantity ?? 1,
  product: item?.product ?? null,
  variant: item.variant ?? null,
  id: item?.id ?? 0,

  async icreamentQuantity() {
    console.log("start increament");
    this.quantity = this.quantity + 1;
    try {
      await window.updateItemQuatity(this.id, this.quantity);
      window.notify("qauntity updated well");
    } catch (error) {
      window.notify(error);
    }
  },

  async decreamentQuantity() {
    if (this.quantity == 1) {
      return null;
    } else {
      this.quantity = this.quantity - 1;
      try {
        await window.updateItemQuatity(this.id, this.quantity);
        window.notify("qauntity updated well");
      } catch (error) {
        window.notify(error, true);
      }
    }
  },

  async removeItem() {
    try {
      await window.removeCartItem(item.id);
      window.notify("item deleted well ");
      this.$store.cart.clearItemCart();
      setTimeout(window.location.reload(), 4000);
    } catch (error) {
      window.notify(error, true);
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
