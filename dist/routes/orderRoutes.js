"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.orderRoutes = void 0;
const responseClasses_1 = require("./../utils/responseClasses");
const responseClasses_2 = require("../utils/responseClasses");
const underscore_1 = __importDefault(require("underscore"));
const invoiceServices_1 = require("../services/invoiceServices");
const crypto_1 = require("crypto");
const middleware_1 = require("../authentication/middleware");
const orderRoutes = async (fastify, opt) => {
    //GET /api/orders - Get user's orders
    fastify.get("/orders", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            if (!request.session.user?.id) {
                return reply
                    .status(400)
                    .send(new responseClasses_2.ResError(400, " please sign in again", " Unauthorized "));
            }
            const { page } = request.query ?? "0";
            const orders = await fastify.prisma.order.findMany({
                where: { userId: request.session.user?.id },
                skip: 20 * parseInt(page),
                take: 20,
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
                    .send(new responseClasses_2.ResError(500, " error in creating order", "failed creation"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/orders/:id - Get order details
    fastify.get("/orders/:id", 
    //{preHandler:isAuthenticate},
    async (request, reply) => {
        try {
            const { id } = request.params;
            const order = await fastify.prisma.order.findUnique({
                where: { id: parseInt(id) },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                },
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(500, ` error in getting order with id = ${id}`, "failed"));
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
                    .send(new responseClasses_2.ResError(500, ` error in cancelling order with id = ${id}`, "failed"));
            }
            return reply.send(order);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //PUT /api/orders/:id/update order
    fastify.put("/orders/:id", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const { id } = request.params;
            const { shippingAddressId, ...data } = request.body;
            const order = await fastify.prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    ...data,
                    shippingAddressId: parseInt(shippingAddressId),
                },
            });
            if (!order) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(500, ` error in updating order with id = ${id}`, "failed"));
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
                    .send(new responseClasses_2.ResError(400, " please sign in again", " Unauthorized "));
            }
            const { id } = request.params;
            const orderInvoice = await (0, invoiceServices_1.createOrderInvoice)();
            if (!orderInvoice) {
                return reply
                    .status(500)
                    .send(new responseClasses_2.ResError(500, ` error in getting orderInvoice `, "failed"));
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
                    .send(new responseClasses_2.ResError(500, ` error in updating order with id = ${id}`, "failed"));
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
    fastify.get("/admin/orders", 
    // { preHandler: isAdminAuth },
    async (request, reply) => {
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
    fastify.get("hash/order/:id/currency/:currncy", async (request, replay) => {
        const { id } = request.params;
        const { currncy } = request.params;
        const order = await fastify.prisma.order.findUnique({
            where: { id: parseInt(id) },
        });
        if (!order) {
            return replay
                .status(404)
                .send(new responseClasses_2.ResError(404, "not found ", " not found"));
        }
        const CustomerReference = order.userId; // Your customer ID for saving the card
        const mid = "MID-25920-522"; // Your actual merchant ID
        const amount = order.total; // Format to 2 decimal places
        const currency = currncy; // e.g., "EGP"
        const orderId = order?.id; // e.g., 99
        const secret = process.env.KASHIER_KEY;
        const path = `/?payment=${mid}.${orderId}.${amount}.${currency}${CustomerReference ? "." + CustomerReference : ""}`;
        const hash = (0, crypto_1.createHmac)("sha256", secret).update(path).digest("hex");
        // The result hash for /?payment=mid-0-1.99.20.EGP with secret 11111
        // should be 606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec
        return replay.send(new responseClasses_1.CustomResponse({ hash: hash }, null));
    });
    fastify.post("/order/webhook", async (request, reply) => {
        //webhook signature
        console.log("called webhook");
        const { data, event } = request.body;
        data.signatureKeys.sort();
        const queryString = await Promise.resolve().then(() => __importStar(require("query-string")));
        const objectSignaturePayload = underscore_1.default.pick(data, data.signatureKeys);
        const signaturePayload = queryString.default.stringify(objectSignaturePayload);
        const signature = (0, crypto_1.createHmac)("sha256", process.env.KASHIER_KEY)
            .update(signaturePayload)
            .digest("hex");
        const kashierSignature = request.headers["x-kashier-signature"];
        if (kashierSignature === signature) {
            console.log("valid signature");
            console.log("event: ", event);
            if ((event === "pay" && data.status === "SUCCESS") ||
                (event === "capture" && data.status === "SUCCESS")) {
                await fastify.prisma.order.update({
                    where: { id: parseInt(data.merchantOrderId) },
                    data: {
                        paymentStatus: "PAID",
                    },
                });
            }
            return reply.status(200);
        }
        else {
            console.log("invalid signature");
            return reply.status(500);
        }
    });
};
exports.orderRoutes = orderRoutes;
