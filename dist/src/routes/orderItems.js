"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderItemsRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const orderItemsRoutes = async (fastify, opt) => {
    //create many ordersItems
    fastify.post("/orderItems", async (request, reply) => {
        try {
            const itemsData = request.body;
            const orderItems = await fastify.prisma.orderItem.createMany({
                data: itemsData,
            });
            return reply.send(orderItems);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //create one orderItem
    fastify.post("/orderItem", async (request, reply) => {
        try {
            const itemData = request.body;
            const orderItem = await fastify.prisma.orderItem.create({
                data: itemData,
            });
            return reply.send(orderItem);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update orderItem
    fastify.put("/orderItems/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            const itemsData = request.body;
            const orderItem = await fastify.prisma.orderItem.update({
                data: itemsData,
                where: { id: parseInt(id) },
            });
            return reply.send(orderItem);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //delete orderItem
    fastify.delete("/orderItems/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            await fastify.prisma.orderItem.delete({
                where: { id: parseInt(id) },
            });
            return reply.send(new responseClasses_1.CustomResponse("order item deleted well", null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.orderItemsRoutes = orderItemsRoutes;
