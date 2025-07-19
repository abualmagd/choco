"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartStore = void 0;
exports.cartStore = {
    count: 0,
    init() {
        this.count = JSON.parse(localStorage.getItem("cartCount")) || 0;
    },
    updateCart() {
        this.count = this.count + 1;
        localStorage.setItem("cartCount", JSON.stringify(this.count));
    },
};
