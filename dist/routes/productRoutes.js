"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const productRoutes = async (fastify, opt) => {
    //get list of products
    fastify.get("/products", async (request, reply) => {
        try {
            const products = await fastify.prisma.product.findMany();
            reply.send({ data: products });
        }
        catch (error) {
            reply.send(error).status(500);
        }
    });
    //create one product must be admin
    fastify.post("/products", async (request, reply) => {
        try {
            const newProduct = await fastify.prisma.product.create({
                data: request.body,
            });
            reply.status(201).send(newProduct);
        }
        catch (error) {
            reply.status(409).send(error);
        }
    });
    //get product with reviews and discouts
    fastify.get("/products-reviews-discout", async (request, reply) => {
        try {
            const products = await fastify.prisma.product.findMany({
                include: {
                    reviews: true,
                    discounts: true,
                },
            });
            reply.send({ data: products });
        }
        catch (error) {
            reply.send(error).status(500);
        }
    });
    //get product by slug
    fastify.get("/products/:slug", async (request, reply) => {
        const product = await fastify.prisma.product.findUnique({
            where: {
                slug: request.params.slug,
            },
            include: {
                reviews: true,
                discounts: true,
                categories: true,
                variants: true,
            },
        });
        if (!product) {
            reply.status(404).send({
                message: "no product has this slug",
                error: "Not Found",
                statusCode: 404,
            });
        }
        reply.send(product);
    });
    fastify.delete("/products/:id", async (request, reply) => { });
};
exports.productRoutes = productRoutes;
