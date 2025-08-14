"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const invoiceServices_1 = require("../services/invoiceServices");
const middleware_1 = require("../authentication/middleware");
const orderRoutes = async (fastify, opt) => {
    //GET /api/orders - Get user's orders
    fastify.get("/orders", async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_1.ResError(400, " please sign in again", " Unauthorized "));
            }
            const orders = await fastify.prisma.order.findMany({
                where: { userId: request.session.user?.id },
            });
            return reply.send(orders);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //POST /api/orders - Create new order
    fastify.post("/orders", async (request, reply) => {
        try {
            const orderData = request.body;
            const order = await fastify.prisma.order.create({
                data: {
                    orderNumber: orderData.orderNumber,
                    userId: request.session.user?.id,
                    subtotal: orderData.subtotal,
                    tax: orderData.tax,
                    shipping: orderData.shipping,
                    discount: orderData.discount,
                    total: orderData.total,
                    paymentMethod: orderData.paymentMethod,
                },
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, " error in creating order", "failed creation"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/orders/:id - Get order details
    fastify.get("/orders/:id", async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_1.ResError(400, " please sign in again", " Unauthorized "));
            }
            const { id } = request.params;
            const order = await fastify.prisma.order.findUnique({
                where: { id: parseInt(id) },
                include: {
                    items: true,
                },
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, ` error in getting order with id = ${id}`, "failed"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //PUT /api/orders/:id/cancel - Cancel order
    fastify.put("/admin/orders/cancel/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            const order = await fastify.prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    status: "CANCELLED",
                },
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, ` error in cancelling order with id = ${id}`, "failed"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //PUT /api/orders/:id/update order
    fastify.put("/orders/:id", async (request, reply) => {
        try {
            const { id } = request.params;
            const data = request.body;
            const order = await fastify.prisma.order.update({
                where: { id: parseInt(id) },
                data: data,
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, ` error in updating order with id = ${id}`, "failed"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/orders/:id/invoice - Get order invoice
    fastify.get("/orders/:id/invoice", async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_1.ResError(400, " please sign in again", " Unauthorized "));
            }
            const { id } = request.params;
            const orderInvoice = await (0, invoiceServices_1.createOrderInvoice)();
            if (!orderInvoice) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, ` error in getting orderInvoice `, "failed"));
            }
            return reply.send(orderInvoice);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //Admin Order Management
    // admin-moderator updating order
    fastify.put("/admin/orders/:id", { preHandler: middleware_1.isModeratorAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const newData = request.body;
            const order = await fastify.prisma.order.update({
                where: { id: parseInt(id) },
                data: newData,
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, ` error in updating order with id = ${id}`, "failed"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/admin/orders - List all orders (admin) with query
    fastify.get("/admin/orders/query", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const query = request.query;
            const orders = await fastify.prisma.order.findMany({
                where: query,
            });
            return reply.send(orders);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/admin/orders/stats - Order statistics (admin)
    fastify.get("/admin/orders/stats", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { status } = request.query;
            const orders = await fastify.prisma.order.findMany({
                where: {
                    status: status,
                },
            });
            return reply.send(orders);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //get all orders with pagination
    fastify.get("/admin/orders", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { page, ...restQuery } = request.query;
            const orders = await fastify.prisma.order.findMany({
                skip: 20 * parseInt(page),
                take: 20,
                where: restQuery,
            });
            return reply.send(orders);
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.orderRoutes = orderRoutes;
