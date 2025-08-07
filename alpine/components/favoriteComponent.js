import { addToWishList, removeFromWishList } from "../utils/api";
import { notify } from "../utils/services";

export default (productId) => ({
  isLoading: false,
  isLiked: false,
  likedList: [],
  init() {
    try {
      this.likedList = JSON.parse(localStorage.getItem("likedList")) || [];
    } catch (e) {
      this.likedList = [];
    }

    if (!Array.isArray(this.likedList)) {
      this.likedList = [];
    }

    this.isLiked = this.likedList.includes(productId);
  },

  async addToWish() {
    this.isLoading = true;
    try {
      if (this.isLiked) {
        await removeFromWishList(productId);

        this.isLiked = false;
        notify("product removed from wishlist");
        if (this.likedList.includes(productId)) {
          const filtered = this.likedList.filter((e) => e !== productId);
          localStorage.setItem("likedList", JSON.stringify(filtered));
        }
      }
      await addToWishList({
        productId: productId,
      });

      this.isLiked = true;
      notify("product added to wishlist");
      if (!this.likedList.includes(productId)) {
        this.likedList.push(productId);
        localStorage.setItem("likedList", JSON.stringify(this.likedList));
      }
    } catch (error) {
      if (error == "Error: Unauthorized") {
        window.openAuthModal();
        this.isLoading = false;
      } else {
        notify(error, true);
        this.isLoading = false;
      }
    }
  },
});
