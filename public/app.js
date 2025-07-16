document.addEventListener("alpine:init", () => {
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
        await addToCartApi({
          productId: this.productId,
          qauntity: this.count,
        });

        Alpine.store("cart").updateCart();
        notify(" product added to your cart");
        this.isLoading = false;
      } catch (error) {
        this.error = error;
      } finally {
        this.isLoading = false;
      }
    },
  }));
});

document.addEventListener("DOMContentLoaded", () => {
  Alpine.start();
});

window.API_KEY = '{{ env("API_KEY_1") }}';

window.addToCartApi = async function AddToCart(data) {
  try {
    const response = await fetch("/api/cart/add", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": window.API_KEY,
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

window.notify = (message, error = false) => {
  Toastify({
    text: message,
    gravity: "bottom",
    stopOnFocus: true,
    position: "center",
    close: true,
    duration: 3000,
    style: {
      background: error
        ? "linear-gradient(to right, #c62336, #f94845)"
        : "linear-gradient(to right, #3fea2c, #31c47f)",
    },
  }).showToast();
};

window.addToWishList = async (data) => {
  try {
    const response = await fetch("/api/wishItems", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key": window.API_KEY,
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
