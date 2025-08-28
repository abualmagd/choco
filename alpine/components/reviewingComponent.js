import { createReview } from "../utils/api";
import { notify } from "../utils/services";

export default (productId) => ({
  rating: 0,
  show: false,
  content: "",
  title: "",
  hover: 0,

  toggleComponent() {
    this.show = !this.show;
  },

  updateHover(rate) {
    this.hover = rate;
  },

  updateRating(rate) {
    this.rating = rate;
  },

  async createUserReview() {
    if (this.rating === 0 || this.content === "" || this.title === "") {
      notify("complete all fields", true);
    } else {
      try {
        await createReview(productId, {
          title: this.title,
          rating: this.rating,
          comment: this.content,
        });
        notify("review created", false);
        this.show = false;
      } catch (error) {
        notify(String(error), true);
      }
    }
  },
});
