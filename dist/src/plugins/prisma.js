"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const client_1 = require("@prisma/client");
/*// Use TypeScript module augmentation to declare the type of server.prisma to be PrismaClient
declare module "fastify" {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}*/
const prismaPlugin = (0, fastify_plugin_1.default)(async (server, options) => {
    const prisma = new client_1.PrismaClient();
    await prisma.$connect();
    // Make Prisma Client available through the fastify server instance: server.prisma
    server.decorate("prisma", prisma);
    server.addHook("onClose", async (server) => {
        await server.prisma.$disconnect();
    });
});
exports.default = prismaPlugin;
