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
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("@fastify/cors"));
const rate_limit_1 = __importDefault(require("@fastify/rate-limit"));
const responseClasses_1 = require("./utils/responseClasses");
const userRoutes_1 = require("./routes/userRoutes");
const fileRoutes_1 = require("./routes/fileRoutes");
const fastify_multipart_1 = __importDefault(require("fastify-multipart"));
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: true,
});
const start = async () => {
    try {
        await server.register(cors_1.default, {
            origin: [" http://[::1]:3000", "http://localhost:5173"],
            methods: ["GET", "POST", "DELETE", "PUT"],
            allowedHeaders: ["Content-Type", "Authorization", "X-API-KEY"],
            credentials: true,
        });
        await server.register(rate_limit_1.default, {
            global: true,
            max: 100,
            timeWindow: 60000,
            ban: 5,
            cache: 10000,
            keyGenerator(req) {
                return req.headers["x-api-key"] || req.ip;
            },
        });
        /*await server.register(fastifyHelmet, {
          contentSecurityPolicy: {
            directives: {
              defaultSrc: ["'self'"],
              scriptSrc: ["'self'", "'unsafe-inline'"],
              styleSrc: ["'self'", "'unsafe-inline'"],
            },
          },
        });*/
        await server.register(require("@fastify/static"), {
            root: path_1.default.join(process.cwd(), "public"),
            prefix: "/public/", // optional: default '/'
        });
        await server.register(fastify_multipart_1.default, {
            limits: {
                fileSize: Number(process.env.MAX_FILE_SIZE),
                files: 10,
            },
        });
        await server.register(prisma_1.default);
        await server.register(productRoutes_1.productRoutes, { prefix: "/api/" });
        await server.register(categoryRoutes_1.categoryRoutes, { prefix: "/api/" });
        await server.register(variantRoutes_1.variantRoutes, { prefix: "/api/" });
        await server.register(cartRoutes_1.cartRoutes, { prefix: "/api/" });
        await server.register(orderRoutes_1.orderRoutes, { prefix: "/api/" });
        await server.register(orderItems_1.orderItemsRoutes, { prefix: "/api/" });
        await server.register(wishlistItems_1.wishItemsRoutes, { prefix: "/api/" });
        await server.register(discountRoutes_1.discountRoutes, { prefix: "/api/" });
        await server.register(userRoutes_1.userRoutes, { prefix: "/api/" });
        await server.register(fileRoutes_1.FileRoutes, { prefix: "/api/" });
        await server.register(viewRoutes_1.viewRoutes);
        await server.register(edge_1.EdgePlugin);
        await server.register(cookie_1.default);
        await server.register(session_1.default, auth_1.sessionOption);
        await server.register(oauth2_1.default, auth_1.oauthGoogleOption);
        await server.register(oauth2_1.default, auth_1.oauthFaceBookOption);
        await server.register(authRoutes_1.authRouters, {
            prefix: "/api/auth/",
        });
        server.addHook("onRequest", async (request, reply) => {
            const apiKey = request.headers["x-api-key"];
            const validKeys = new Set([process.env.API_KEY_1, process.env.API_KEY_2]);
            if (request.url.startsWith("/api")) {
                if (!apiKey || !validKeys.has(apiKey)) {
                    return reply
                        .status(401)
                        .send(new responseClasses_1.ResError(401, "Invalid or missing API key", "unauthorized call"));
                }
            }
            else {
                return;
            }
        });
        const myPort = Number(process.env.MY_PORT) || 5445;
        server.listen({ port: myPort }, (err, adress) => {
            if (err) {
                console.log(err);
                process.exit(1);
            }
            console.log("server listening at ", adress);
        });
    }
    catch (error) { }
};
start();
