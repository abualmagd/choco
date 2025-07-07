"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_1 = require("./routes/productRoutes");
const prisma_1 = __importDefault(require("./plugins/prisma"));
const cookie_1 = __importDefault(require("@fastify/cookie"));
const session_1 = __importDefault(require("@fastify/session"));
const auth_1 = require("./authentication/auth");
const oauth2_1 = __importDefault(require("@fastify/oauth2"));
const authRoutes_1 = require("./routes/authRoutes");
const categoryRoutes_1 = require("./routes/categoryRoutes");
const variantRoutes_1 = require("./routes/variantRoutes");
const cartRoutes_1 = require("./routes/cartRoutes");
const orderRoutes_1 = require("./routes/orderRoutes");
const orderItems_1 = require("./routes/orderItems");
const wishlistItems_1 = require("./routes/wishlistItems");
const discountRoutes_1 = require("./routes/discountRoutes");
const viewRoutes_1 = require("./routes/viewRoutes");
const edge_1 = require("./plugins/edge");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: true,
});
const start = async () => {
    try {
        await server.register(prisma_1.default);
        await server.register(productRoutes_1.productRoutes, { prefix: "/api/" });
        await server.register(categoryRoutes_1.categoryRoutes, { prefix: "/api/" });
        await server.register(variantRoutes_1.variantRoutes, { prefix: "/api/" });
        await server.register(cartRoutes_1.cartRoutes, { prefix: "/api/" });
        await server.register(orderRoutes_1.orderRoutes, { prefix: "/api/" });
        await server.register(orderItems_1.orderItemsRoutes, { prefix: "/api/" });
        await server.register(wishlistItems_1.wishItemsRoutes, { prefix: "/api/" });
        await server.register(discountRoutes_1.discountRoutes, { prefix: "/api/" });
        await server.register(viewRoutes_1.viewRoutes);
        /*server.decorateReply(
          "view",
          async function (template: string, state?: Record<string, any>) {
            const { Edge } = await import("edge.js");
            const edge = Edge.create();
            edge.mount(path.join(__dirname, "./views"));
            const html = edge.render(template, state);
            this.header("content-type", "text/html; charset=utf-8");
            this.send(html);
          }
        );*/
        await server.register(edge_1.EdgePlugin);
        await server.register(cookie_1.default);
        await server.register(session_1.default, auth_1.sessionOption);
        await server.register(oauth2_1.default, auth_1.oauthGoogleOption);
        await server.register(oauth2_1.default, auth_1.oauthFaceBookOption);
        await server.register(authRoutes_1.authRouters, {
            prefix: "/api/auth/",
        });
        server.log.info(`Prisma available: ${!!server.prisma}`);
        const myPort = Number(process.env.MY_PORT) || 5445;
        server.listen({ port: myPort }, (err, adress) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("server listening at ", adress);
        });
        server.get("/", (request, reply) => {
            return reply.send("hello from my choco");
        });
    }
    catch (error) { }
};
start();
