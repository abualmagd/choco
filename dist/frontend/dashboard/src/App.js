"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const home_1 = __importDefault(require("./pages/home"));
require("./App.css");
const layout_1 = __importDefault(require("./pages/layout"));
function App() {
    return (<layout_1.default>
      <home_1.default />
    </layout_1.default>);
}
exports.default = App;
