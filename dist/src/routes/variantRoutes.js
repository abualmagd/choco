"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.variantRoutes = void 0;
const responseClasses_1 = require("./../utils/responseClasses");
const middleware_1 = require("../authentication/middleware");
const responseClasses_2 = require("../utils/responseClasses");
const variantRoutes = async (fastify, opt) => {
    ///api/products/:id/variants - Create variant (admin)
    fastify.post("/products/:id/variants", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const bodyData = request.body;
            const variant = await fastify.prisma.productVariant.create({
                data: {
                    ...bodyData,
                    product: {
                        connect: { id: parseInt(id) },
                    },
                },
            });
            if (!variant) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(500, "creation failed", "error in creation"));
            }
            return reply.send(variant);
        }
        catch (error) {
            reply.send(error);
        }
    });
    ///api/products/:id/variants - Get variant of an product
    fastify.get("/products/:id/variants", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const variants = await fastify.prisma.productVariant.findMany({
                where: { productId: parseInt(id) },
            });
            if (!variants) {
                return reply
                    .status(404)
                    .send(new responseClasses_2.ResError(404, `not found variant for product has id ${id}`, "not found"));
            }
            return reply.send(variants);
        }
        catch (error) {
            reply.send(error);
        }
    });
    //api/products/variants/:variantId - Update variant (admin)
    fastify.put("/products/variants/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const bodyData = request.body;
            const variant = await fastify.prisma.productVariant.update({
                where: { id: parseInt(id) },
                data: bodyData,
            });
            if (!variant) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(500, "creation failed", "error in creation"));
            }
            return reply.send(variant);
        }
        catch (error) {
            reply.send(error);
        }
    });
    ///api/products/:id/variants/:variantId - Delete variant (admin)
    fastify.delete("/products/variants/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            await fastify.prisma.productVariant.delete({
                where: { id: parseInt(id) },
            });
            reply
                .status(200)
                .send(new responseClasses_1.CustomResponse("deleted successfully", null));
        }
        catch (error) {
            reply.send(error);
        }
    });
    //get variants details
    fastify.get("/products/variants/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const variant = await fastify.prisma.productVariant.findUnique({
                where: { id: parseInt(id) },
            });
            if (!variant) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(404, `not found product by id ${id}`, "not found"));
            }
            return reply.send(variant);
        }
        catch (error) {
            reply.send(error);
        }
    });
};
exports.variantRoutes = variantRoutes;
