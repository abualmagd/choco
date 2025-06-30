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
const authRouters_1 = require("./routes/authRouters");
const categoryRoutes_1 = require("./routes/categoryRoutes");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: true,
});
const start = async () => {
    try {
        await server.register(prisma_1.default);
        await server.register(productRoutes_1.productRoutes, { prefix: "/api/" });
        await server.register(categoryRoutes_1.categoryRoutes, { prefix: "/api/" });
        await server.register(cookie_1.default);
        await server.register(session_1.default, auth_1.sessionOption);
        await server.register(oauth2_1.default, auth_1.oauthGoogleOption);
        await server.register(oauth2_1.default, auth_1.oauthFaceBookOption);
        await server.register(authRouters_1.authRouters, {
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
