"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewRoutes = void 0;
const viewRoutes = async (fastify, opt) => {
    fastify.get("/", async (request, reply) => {
        try {
            return reply.view("home", { username: "Ismail" });
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.get("/products/:slug", async (request, reply) => {
        try {
            const { slug } = request.params;
            const data = await fastify.prisma.product.findUnique({
                where: { slug: slug },
                include: {
                    reviews: {
                        take: 5,
                    },
                    discounts: true,
                    categories: true,
                    variants: true,
                },
            });
            return reply.view("product", { product: data });
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.viewRoutes = viewRoutes;
