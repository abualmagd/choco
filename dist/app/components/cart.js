"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = cartComponent;
const utils_1 = require("./methods/utils");
function cartComponent(productId) {
    return {
        count: 1,
        size: "8",
        color: "red",
        isLoading: false,
        error: null,
        async addToCart() {
            this.isLoading = true;
            try {
                //TODO: edit here
                const response = await fetch("/api/cart/add", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-api-key": process.env.API_KEY_1,
                    },
                    body: JSON.stringify({
                        count: this.count,
                        productId: productId,
                    }),
                });
                if (!response.ok) {
                    this.error = "failed to add product to cart";
                    this.isLoading = false;
                }
                window.Alpine.store("cart").updateCart();
                (0, utils_1.notify)(" product added to your cart");
                this.isLoading = false;
            }
            catch (error) {
                this.error = error;
            }
            finally {
                this.isLoading = false;
            }
        },
    };
}
