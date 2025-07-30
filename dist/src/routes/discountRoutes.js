"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.discountRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const middleware_1 = require("../authentication/middleware");
const discountRoutes = async (fastify, opt) => {
    //list active discounts
    fastify.get("/discounts", async (request, reply) => {
        try {
            const aciveDiscounts = await fastify.prisma.discount.findMany({
                where: { isActive: true },
            });
            return reply.send(aciveDiscounts);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //validate discount
    fastify.post("/discounts/validate/:code", async (request, reply) => {
        try {
            const { code } = request.params;
            const discount = await fastify.prisma.discount.findUnique({
                where: {
                    code: code,
                },
            });
            if (!discount?.isActive) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, " code is invalid, discount is inactive", "invalid error"));
            }
            if (discount?.endDate > new Date()) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, " discount code is invalid, itis expired", "invalid error"));
            }
            if (discount?.usedCount > discount.maxUses) {
                return reply
                    .status(500)
                    .send(new responseClasses_1.ResError(500, " code is invalid, discount reach the max use", "invalid error"));
            }
            return reply.status(200).send(discount);
        }
        catch (error) { }
    });
    //discount admin routes
    //create (add) one discount
    fastify.post("/admin/discounts", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const discountData = request.body;
            const createdDiscount = await fastify.prisma.discount.create({
                data: discountData,
            });
            return reply.send(createdDiscount);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update discount data
    fastify.put("/admin/discounts/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const discountData = request.body;
            const updatedDiscount = await fastify.prisma.discount.update({
                where: {
                    id: parseInt(id),
                },
                data: discountData,
            });
            return reply.send(updatedDiscount);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //delete discount
    fastify.delete("/admin/discounts/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            await fastify.prisma.discount.delete({
                where: { id: parseInt(id) },
            });
            return reply.send(new responseClasses_1.CustomResponse("discount deleted well", null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //get all discounts with optional query
    fastify.get("/admin/discounts", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const query = request.query;
            const discounts = await fastify.prisma.discount.findMany({
                where: {
                    isActive: query.isActive,
                    endDate: query.endDate,
                    usedCount: query.usedCount,
                    products: query.products,
                },
            });
            if (!discounts) {
                return reply
                    .status(404)
                    .send(new responseClasses_1.ResError(404, "no discounts founded", " not found"));
            }
            return reply.send(discounts);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/admin/discounts/:id
    fastify.get("/admin/discounts/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { id } = request.params;
            const discount = await fastify.prisma.discount.findUnique({
                where: { id: parseInt(id) },
            });
            if (!discount) {
                return reply
                    .status(404)
                    .send(new responseClasses_1.ResError(404, ` not found  discount with id ${id}`, " not found error"));
            }
            return reply.send(discount);
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.discountRoutes = discountRoutes;
