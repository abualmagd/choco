document.addEventListener("alpine:init", () => {
  console.log("alpine init");
  Alpine.store("productGallery", {
    instance: null,
    setInstance(instance) {
      this.instance = instance;
    },
    next() {
      if (this.instance) this.instance.go(">");
    },
    prev() {
      if (this.instance) this.instance.go("<");
    },
  });

  Alpine.store("cart", {
    count: 0,

    init() {
      this.count = localStorage.getItem("cartCount") || 0;
    },

    updateCart() {
      this.count = this.count + 1;
      localStorage.setItem("cartCount", this.count);
    },
  });

  Alpine.data("cartComponent", (productId) => ({
    count: 1,
    size: 8,
    color: "yellow",
    isLoading: false,
    error: null,
    productId: productId,

    async addToCart() {
      this.isLoading = true;
      try {
        console.log("hel");
        await addToCartApi({
          productId: this.productId,
          qauntity: this.count,
        });

        Alpine.store("cart").updateCart();
        this.isLoading = false;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  }));
});

window.addToCartApi = async function AddToCart(data) {
  try {
    console.log("start adding");
    const response = await fetch("/api/cart/add", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
    });
    console.log(response);
    if (!response.ok) {
      throw new Error("Failed to add to cart");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
});
