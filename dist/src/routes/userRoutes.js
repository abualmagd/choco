"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const middleware_1 = require("../authentication/middleware");
const userRoutes = async (fastify, opt) => {
    fastify.post("user/update/:id", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const user = await fastify.prisma.user.update({
                where: { id: parseInt(id) },
                data: data,
            });
            if (!user) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, "failed to update user", "failed"));
            }
            return reply.send(user);
        }
        catch (error) {
            reply.send(error);
        }
    });
    fastify.get("user/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            const user = await fastify.prisma.user.findUnique({
                where: { id: parseInt(id) },
                include: {
                    addresses: true,
                },
            });
            if (!user) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, "failed to find user", "failed"));
            }
            return reply.send(user);
        }
        catch (error) {
            reply.send(error);
        }
    });
    //add new address
    fastify.post("user/address", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const id = request.session?.user?.id;
            const data = request.body;
            const address = await fastify.prisma.address.create({
                data: {
                    userId: id,
                    ...data,
                },
            });
            if (!address) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, "failed to add address", "failed"));
            }
            return reply.send(address);
        }
        catch (error) {
            reply.send(error);
        }
    });
    //add new address
    fastify.put("user/address", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const data = request.body;
            const address = await fastify.prisma.address.update({
                where: { id: data.id },
                data: data,
            });
            if (!address) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, "failed to add address", "failed"));
            }
            return reply.send(address);
        }
        catch (error) {
            reply.send(error);
        }
    });
};
exports.userRoutes = userRoutes;
