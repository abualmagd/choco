"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const productRoutes = async (fastify, opt) => {
    fastify.get("/products", async (request, reply) => {
        try {
            const products = await fastify.prisma.product.findMany();
            reply.send({ data: products });
        }
        catch (error) {
            reply.send(error).status(500);
        }
    });
    fastify.get("/prisma-check", async (request, reply) => {
        return {
            prismaExists: !!fastify.prisma,
            models: fastify.prisma ? Object.keys(fastify.prisma) : [],
        };
    });
};
exports.productRoutes = productRoutes;
