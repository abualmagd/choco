"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EdgePlugin = void 0;
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const path_1 = __importDefault(require("path"));
const edge_js_1 = require("edge.js");
let edgeInstance = null;
exports.EdgePlugin = (0, fastify_plugin_1.default)(async (fastify, opt) => {
    if (!edgeInstance) {
        edgeInstance = new edge_js_1.Edge({
            cache: false,
        });
        edgeInstance.mount(path_1.default.join(process.cwd(), "views")); // Adjust path as needed
    }
    const siteSettings = await fastify.prisma.siteSettings.findMany();
    fastify.decorateReply("view", async function (template, state) {
        const html = await edgeInstance.render(template, {
            ...state,
            settings: siteSettings,
        });
        this.header("content-type", "text/html; charset=utf-8");
        this.send(html);
    });
});
