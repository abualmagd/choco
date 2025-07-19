"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const alpinejs_1 = __importDefault(require("alpinejs"));
const cart_1 = __importDefault(require("./components/cart"));
const cart_2 = require("./stores/cart");
// Initialize Alpine
document.addEventListener("alpine:init", () => {
    // Register components
    alpinejs_1.default.data("cartComponent", cart_1.default);
    // Register stores
    alpinejs_1.default.store("cart", cart_2.cartStore);
});
// Start Alpine when ready
document.addEventListener("DOMContentLoaded", () => {
    alpinejs_1.default.start();
});
