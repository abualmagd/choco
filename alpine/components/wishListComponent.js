import { removeFromWishList } from "../utils/api";
import { notify } from "../utils/services";

export default (item) => ({
  id: item.id,
  productId: item.productId ?? "",
  variantId: item.variantId ?? "",
  likedList: [],

  init() {
    try {
      this.likedList = JSON.parse(localStorage.getItem("likedList")) || [];
    } catch (e) {
      this.likedList = [];
    }
  },

  async removeItemWish() {
    try {
      console.log("removing");
      console.log("id", this.productId);
      console.log(this.likedList);

      if (
        this.likedList.includes(this.productId) ||
        this.likedList.includes(this.variantId)
      ) {
        console.log("filtering");
        const filtered = this.likedList.filter((e) => e !== this.productId);
        const lFiltered = filtered.filter((e) => e !== this.variantId);
        console.log(lFiltered);
        localStorage.setItem("likedList", JSON.stringify(lFiltered));
      }
      await removeFromWishList(this.id);
      window.location.reload();
    } catch (error) {
      notify(String(error), true);
    }
  },
});
