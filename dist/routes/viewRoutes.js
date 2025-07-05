"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewRoutes = void 0;
const viewRoutes = async (fastify, opt) => {
    fastify.get("/home", async (request, reply) => {
        try {
            return reply.view("home", { username: "Ismail" });
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.get("/product/:slug", async (request, reply) => {
        return "view here product page";
    });
};
exports.viewRoutes = viewRoutes;
