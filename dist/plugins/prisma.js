"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaPlug = void 0;
const client_1 = require("@prisma/client");
const prismaPlug = async (fastify) => {
    const prisma = new client_1.PrismaClient();
    await prisma.$connect();
    fastify.decorate("prisma", prisma);
    fastify.addHook("onClose", async (server) => {
        await server.prisma.$disconnect();
    });
};
exports.prismaPlug = prismaPlug;
