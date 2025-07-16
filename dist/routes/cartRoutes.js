"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const auth_1 = require("../authentication/auth");
const cartRoutes = async (fastify, opt) => {
    //GET /api/cart - Get user's cart
    fastify.get("/cart", async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_1.ResError(400, " please sign in again", " Unauthorized "));
            }
            const cart = await fastify.prisma.cart.findUnique({
                where: { userId: request.session.user?.id },
                include: {
                    items: true,
                },
            });
            return reply.send(cart);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //create cart for user
    fastify.post("/cart", async (request, reply) => {
        try {
            const cart = await fastify.prisma.cart.create({
                data: {
                    userId: request.session.user?.id,
                },
            });
            return reply.send(cart);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update item quantity
    fastify.put("/cart/:itemId", async (request, reply) => {
        try {
            const { itemId } = request.params;
            const { quantity } = request.query;
            const cartItem = await fastify.prisma.cartItem.update({
                where: { id: parseInt(itemId) },
                data: {
                    quantity: parseInt(quantity),
                },
            });
            return reply.send(cartItem);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //add item to cart (create item)
    fastify.post("/cart/add", async (request, reply) => {
        try {
            //user didnot registered
            if (!request.session.user) {
                const anonymousEmail = `anon_${request.ip.replace(/\./g, "-")}@anon.com`;
                const user = await fastify.prisma.user.create({
                    data: {
                        email: anonymousEmail,
                        password: await (0, auth_1.hashPassword)(request.ip + Date.now()), // More unique
                        name: "Anonymous",
                        phone: null,
                    },
                });
                request.session.user = {
                    id: user.id,
                    email: user.email,
                };
                await request.session.save();
            }
            let userCart;
            userCart = await fastify.prisma.cart.findUnique({
                where: { userId: request.session.user?.id },
            });
            if (!userCart) {
                userCart = await fastify.prisma.cart.create({
                    data: {
                        userId: request.session.user?.id,
                    },
                });
            }
            const { productId, variantId } = request.body;
            const cartItem = await fastify.prisma.cartItem.create({
                data: {
                    productId: productId,
                    cartId: userCart.id,
                    variantId: variantId,
                },
                include: {
                    cart: true,
                },
            });
            return reply.send(cartItem);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    ///api/cart/:itemId - Remove item from cart
    fastify.delete("/cart/:itemId", async (request, reply) => {
        try {
            const { itemId } = request.params;
            await fastify.prisma.cartItem.delete({
                where: { id: parseInt(itemId) },
            });
            return reply
                .send(new responseClasses_1.CustomResponse("item deleted well", null))
                .status(200);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    ///api/cart - Clear cart
    fastify.put("/cart/clear", async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_1.ResError(400, " please sign in again", " Unauthorized "));
            }
            const cart = await fastify.prisma.cart.findUnique({
                where: { userId: request.session.user?.id },
            });
            if (!cart) {
                return reply.send(new responseClasses_1.ResError(500, "error in clearing cart", " cart clear error"));
            }
            await fastify.prisma.cartItem.deleteMany({
                where: { cartId: cart.id },
            });
            return reply
                .status(200)
                .send(new responseClasses_1.CustomResponse(" cart cleared well", null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.cartRoutes = cartRoutes;
