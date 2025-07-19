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
      this.count = parseInt(localStorage.getItem("cartCount")) || 0;
    },

    updateCart() {
      this.count = parseInt(this.count) + 1;
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
      console.info("id", productId);
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
  }));

  Alpine.data("favoriteComponent", (productId) => ({
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
        notify(error, true);
        this.isLoading = false;
      }
    },
  }));

  Alpine.data("authModalComponent", () => ({
    isLoginView: true,
    email: null,
    password: null,
    promise: "waiting",

    init() {
      window.openAuthModal = () => {
        console.log("runded open modal");
        this.$nextTick(() => {
          this.$refs.dialog.showModal();
        });
      };
    },

    toggleState() {
      this.isLoginView = !this.isLoginView;
    },

    async LoginWithEmail() {
      this.promise = "loading";
      try {
        await loginEmail({
          email: this.email,
          password: this.password,
        });
        this.promise = "done";
        notify("logined seccussfully");
        this.$refs.dialog.close();
      } catch (error) {
        notify(error, true);
        this.promise = "done";
      } finally {
        this.promise = "waiting";
      }
    },
  }));
});

window.API_KEY = '{{ env("API_KEY_1") }}';

window.addToCartApi = async function AddToCart(data) {
  try {
    const response = await fetch("/api/cart/add", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
    });

    if (!response.ok) {
      console.info("res", response);
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
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
      credentials: "include",
    });
    console.log(response);
    if (!response.ok) {
      if (response.statusText === "Unauthorized") {
        throw new Error("You shoud login first");
      } else {
        throw new Error("Failed to add to wishlist");
      }
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};

window.loginEmail = async (data) => {
  try {
    const response = await fetch("/api/auth/login", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
        "x-api-key":
          "1vmWCOTz1wKzM03TZBg2Sprent6OKNIsqpYu6hYVmnh4izciZU1cd8cvMnG2yE",
      },
      method: "POST",
      credentials: "include",
    });
    console.log(response);
    if (!response.ok) {
      if (response.status === 401) throw new Error("wrong email or password");
      throw new Error("Failed to login");
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};
