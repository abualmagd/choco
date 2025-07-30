"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Layout;
const sidebar_1 = __importDefault(require("../components/sidebar"));
function Layout({ children }) {
    return (<div className=" flex ">
      <sidebar_1.default />
      <main className="flex-1">{children}</main>
    </div>);
}
