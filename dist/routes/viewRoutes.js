"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.viewRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
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
            const res = new responseClasses_1.CustomResponse({
                product: product,
                totalReviews: totalReviews,
                averageRating: averageRating,
                ratingCounts: ratingCounts,
                ratingPercentages: ratingPercentages,
            }, null);
            return reply.view("product", { data: res.data });
        }
        catch (error) {
            return reply.send(error);
        }
    });
};
exports.viewRoutes = viewRoutes;
