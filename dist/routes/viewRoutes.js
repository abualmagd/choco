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
            return reply.view("errorPage", { error: error });
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
                return reply.view("notFound");
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
            return reply.view("errorPage", { error: error });
        }
    });
    fastify.get("/account", async (request, reply) => {
        const userId = request.session.user?.id;
        if (!userId) {
            return reply.view("account", { user: null });
        }
        const user = await fastify.prisma.user.findUnique({
            where: { id: userId },
            include: {
                addresses: true,
            },
        });
        if (!user) {
            return reply.view("account", { user: null });
        }
        return reply.view("account", { user: user });
    });
    fastify.get("/category/:slug", async (request, reply) => {
        const { slug } = request.params;
        try {
            const category = await fastify.prisma.category.findUnique({
                where: {
                    slug: slug,
                },
            });
            if (!category) {
                return reply.view("notFound");
            }
            return reply.view("category", { category: category });
        }
        catch (error) {
            return reply.view("errorPage", { error: error });
        }
    });
    fastify.get("/cart", async (request, reply) => {
        const id = request.session.user?.id;
        if (!id) {
            return reply.redirect("/login?backto=cart");
        }
        const cart = await fastify.prisma.cart.findUnique({
            where: { userId: id },
            include: {
                items: {
                    select: {
                        quantity: true,
                        id: true,
                        product: true,
                        variant: true,
                    },
                },
            },
        });
        //console.log("cart", cart);
        if (!cart) {
            return reply.view("cart", { data: null });
        }
        return reply.view("cart", { data: cart });
    });
    fastify.get("/login", async (request, reply) => {
        return reply.view("login");
    });
};
exports.viewRoutes = viewRoutes;
