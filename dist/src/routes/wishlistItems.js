"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.wishItemsRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const middleware_1 = require("../authentication/middleware");
const wishItemsRoutes = async (fastify, opt) => {
    //get wishlist items
    fastify.get("/wishItems", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const wishItems = await fastify.prisma.wishlistItem.findMany({
                where: { userId: request.session.user?.id },
            });
            return reply.send(wishItems);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //create (add) one wishlistitem
    fastify.post("/wishItems", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const { productId } = request.body;
            const wishlistitem = await fastify.prisma.wishlistItem.create({
                data: {
                    userId: request.session.user?.id,
                    productId: parseInt(productId),
                },
            });
            return reply.send(wishlistitem);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //delete wishlist item
    fastify.delete("/wishItems/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            await fastify.prisma.wishlistItem.delete({
                where: { id: parseInt(id) },
            });
            return reply.send(new responseClasses_1.CustomResponse("wishlist item deleted well", null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.wishItemsRoutes = wishItemsRoutes;
