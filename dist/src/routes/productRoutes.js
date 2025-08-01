"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productRoutes = void 0;
const middleware_1 = require("../authentication/middleware");
const responseClasses_1 = require("../utils/responseClasses");
const productRoutes = async (fastify, opt) => {
    //get list of products
    fastify.get("/products", async (request, reply) => {
        try {
            //  return reply.send(typeof request.query);
            const { page, pagesize } = request.query;
            const skip = page ? (parseInt(page) - 1) * parseInt(pagesize ?? "25") : 0;
            const products = await fastify.prisma.product.findMany({
                skip: skip,
                take: pagesize ? parseInt(pagesize) : 25,
            });
            return reply.send({ data: products });
        }
        catch (error) {
            return reply.send(error).status(500);
        }
    });
    //create one product must be admin
    fastify.post("/products", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const newProduct = await fastify.prisma.product.create({
                data: request.body,
            });
            return reply.status(201).send(newProduct);
        }
        catch (error) {
            return reply.status(409).send(error);
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
            return reply.send({ data: products });
        }
        catch (error) {
            return reply.send(error).status(500);
        }
    });
    //get product by slug
    fastify.get("/products/:slug", async (request, reply) => {
        try {
            const product = await fastify.prisma.product.findUnique({
                where: {
                    slug: request.params.slug,
                },
                include: {
                    reviews: {
                        take: 10,
                    },
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
            return reply.send(product);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //delete product for admin user only
    fastify.delete("/products/:id", { preHandler: middleware_1.isAdminAuth }, async (request, reply) => {
        try {
            const productId = parseInt(request.params.id, 10);
            await fastify.prisma.product.delete({
                where: {
                    id: productId,
                },
            });
            return reply.send({
                data: `product with id=${request.params.id} deleted successfully`,
            });
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update product for admin only
    fastify.put("/products/:id", { preHandler: middleware_1.isModeratorAuth }, async (request, reply) => {
        try {
            const productId = parseInt(request.params.id, 10);
            const updatedData = (await request.body);
            const updatedProduct = await fastify.prisma.product.update({
                data: updatedData,
                where: {
                    id: productId,
                },
                include: {
                    categories: {
                        take: 10,
                    },
                },
            });
            return reply.send(updatedProduct);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //GET /api/products/:id/reviews - Get product reviews
    fastify.get("/products/:id/reviews", async (request, reply) => {
        try {
            const productId = parseInt(request.params.id, 10);
            const reviews = await fastify.prisma.review.findMany({
                where: {
                    productId: productId,
                },
            });
            return reply.send(reviews);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //create review for product //authenticated user only
    fastify.post("/products/:id/reviews", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const productId = parseInt(request.params.id, 10);
            const { title, rating, comment } = request.body;
            const userId = 1; //'getUserId()'
            // Validate rating (1-5 stars)
            if (rating < 1 || rating > 5) {
                return reply.status(400).send({
                    error: "Bad Request",
                    message: "Rating must be between 1 and 5",
                });
            }
            const newReview = await fastify.prisma.review.create({
                data: {
                    title: title,
                    productId: productId,
                    rating: rating,
                    comment: comment,
                    userId: userId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            });
            return reply.send(newReview);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    //update reviews
    fastify.put("/products/:id/reviews", { preHandler: middleware_1.isAuthenticate }, async (request, reply) => {
        try {
            const productId = parseInt(request.params.id, 10);
            const { id, title, rating, comment } = request.body;
            const userId = 1; //'getUserId()'
            // Validate rating (1-5 stars)
            if (rating < 1 || rating > 5) {
                return reply.status(400).send({
                    error: "Bad Request",
                    message: "Rating must be between 1 and 5",
                });
            }
            const newReview = await fastify.prisma.review.update({
                where: { id: id },
                data: {
                    title: title,
                    productId: productId,
                    rating: rating,
                    comment: comment,
                    userId: userId,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
            });
            return reply.send(newReview);
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.delete("/products/:id/reviews", { preHandler: middleware_1.isModeratorAuth }, async (request, reply) => {
        try {
            const { id } = request.body;
            if (!id) {
                return reply.status(400).send({
                    error: "Bad Request",
                    message: "Review id is missing",
                });
            }
            await fastify.prisma.review.delete({
                where: { id: id },
            });
            return reply.send("deleted succesfully");
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.get("/products/ratings/:slug", async (request, reply) => {
        try {
            const { slug } = request.params;
            const product = await fastify.prisma.product.findUnique({
                where: { slug: slug },
                include: {
                    reviews: {
                        take: 10,
                    },
                    discounts: true,
                    categories: true,
                },
            });
            if (!product) {
                return reply.send(new responseClasses_1.ResError(404, " no product with this slug", " not found"));
            }
            const reviewStats = await fastify.prisma.review.groupBy({
                by: ["rating"],
                where: {
                    product: {
                        slug: slug,
                    },
                },
                _count: {
                    rating: true,
                },
            });
            const totalReviews = await fastify.prisma.review.count({
                where: {
                    product: {
                        slug: slug,
                    },
                },
            });
            const averageRating = await fastify.prisma.review.aggregate({
                where: {
                    product: {
                        slug: slug,
                    },
                },
                _avg: {
                    rating: true,
                },
            });
            // Transform the stats into a more usable format
            const ratingCounts = {};
            reviewStats.forEach((stat) => {
                ratingCounts[stat.rating] = stat._count.rating;
            });
            // Fill in missing ratings
            for (let i = 1; i <= 5; i++) {
                if (!ratingCounts[i]) {
                    ratingCounts[i] = 0;
                }
            }
            // Calculate percentages
            const ratingPercentages = {};
            for (let i = 1; i <= 5; i++) {
                ratingPercentages[i] =
                    ratingCounts[1] !== 0
                        ? ((ratingCounts[i] / totalReviews) * 100).toFixed(0) + "%"
                        : "0%";
            }
            return reply.send(new responseClasses_1.CustomResponse({
                product: product,
                totalReviews: totalReviews,
                averageRating: averageRating,
                ratingCounts: ratingCounts,
                ratingPercentages: ratingPercentages,
            }, null));
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.productRoutes = productRoutes;
