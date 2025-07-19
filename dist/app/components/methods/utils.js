"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notify = void 0;
const toastify_js_1 = __importDefault(require("toastify-js"));
require("toastify-js/src/toastify.css");
const notify = (message, error = false) => {
    (0, toastify_js_1.default)({
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
exports.notify = notify;
