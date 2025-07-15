import { FastifyInstance, FastifyPluginAsync, FastifyReply } from "fastify";
import { CustomResponse, ResError } from "../utils/responseClasses";

export const viewRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.get("/", async (request, reply: FastifyReply) => {
    try {
      return reply.view("home", { username: "Ismail" });
    } catch (error) {
      return reply.send(error);
    }
  });

  fastify.get("/products/:slug", async (request, reply) => {
    try {
      const { slug } = request.params as { slug: string };
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
        return reply.send(
          new ResError(404, " no product with this slug", " not found")
        );
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
      const ratingCounts: any = {};
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
      const ratingPercentages: any = {};
      for (let i = 1; i <= 5; i++) {
        ratingPercentages[i] =
          ((ratingCounts[i] / totalReviews) * 100).toFixed(0) + "%";
      }

      const res = new CustomResponse(
        {
          product: product,
          totalReviews: totalReviews,
          averageRating: averageRating,
          ratingCounts: ratingCounts,
          ratingPercentages: ratingPercentages,
        },
        null
      );

      return reply.view("product", { data: res.data });
    } catch (error) {
      return reply.send(error);
    }
  });
};
