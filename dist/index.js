"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const dotenv_1 = __importDefault(require("dotenv"));
const productRoutes_1 = require("./routes/productRoutes");
const client_1 = require("@prisma/client");
dotenv_1.default.config();
const server = (0, fastify_1.default)({
    logger: true,
});
const start = async () => {
    try {
        const prisma = new client_1.PrismaClient();
        await prisma.$connect();
        server.decorate("prisma", prisma);
        server.addHook("onClose", async (server) => {
            await server.prisma.$disconnect();
        });
        await server.register(productRoutes_1.productRoutes, { prefix: "/api/" });
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
