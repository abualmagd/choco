"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SettingsRoute = void 0;
const middleware_1 = require("../authentication/middleware");
const responseClasses_1 = require("../utils/responseClasses");
const SettingsRoute = async (fastify, opt) => {
    //get all settings
    fastify.get("/admin/settings", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const setts = await fastify.prisma.siteSettings.findMany();
            return reply.send(setts);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //create settings keys, value
    fastify.post("/admin/settings", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const body = request.body;
            const setts = await fastify.prisma.siteSettings.createMany({
                data: body,
            });
            fastify.refreshSiteSettings();
            return reply.send(setts);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update settings keys
    fastify.put("/admin/settings", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { key, value } = request.body;
            const setts = await fastify.prisma.siteSettings.update({
                data: {
                    value: value,
                },
                where: {
                    key: key,
                },
            });
            fastify.refreshSiteSettings();
            return reply.send(setts);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //delete settings
    fastify.delete("/admin/settings", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const { key } = request.body;
            await fastify.prisma.siteSettings.delete({
                where: {
                    key,
                },
            });
            fastify.refreshSiteSettings();
            return reply.send(new responseClasses_1.CustomResponse("key deleted", null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.SettingsRoute = SettingsRoute;
