import { Prisma } from "@prisma/client";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";
import {
  isAdminAuth,
  isAuthenticate,
  isModeratorAuth,
} from "../authentication/middleware";
import { CustomResponse, ResError } from "../utils/responseClasses";

export const productRoutes: FastifyPluginAsync = async (fastify, opt: any) => {
  //get list of products
  fastify.get("/products", async (request, reply) => {
    try {
      //  return reply.send(typeof request.query);
      const { page, pagesize } = request.query as {
        page: string;
        pagesize: string;
      };
      const skip = page ? (parseInt(page) - 1) * parseInt(pagesize ?? "25") : 0;
      const products = await fastify.prisma.product.findMany({
        skip: skip,
        take: pagesize ? parseInt(pagesize) : 25,
      });
      return reply.send(products);
    } catch (error) {
      return reply.send(error).status(500);
    }
  });

  //create one product must be admin
  fastify.post(
    "/products",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      const {
        name,
        slug,
        description,
        price,
        compareAtPrice,
        costPrice,
        sku,
        brand,
        trackInventory,
        inventoryQuantity,
        allowBackorder,
        weight,
        height,
        width,
        length,
        isActive,
        isFeatured,
        isDigital,
        downloadUrl,
        seoTitle,
        seoDescription,
        images,
        categoryId,
        color,
        size,
        categories,
      } = request.body as {
        images: Prisma.ProductImageCreateManyInput;
        categories: Array<Prisma.CategoryWhereUniqueInput>;
        categoryId: number;
        inventoryQuantity: string;
        name: string;
        slug: string;
        description: string;
        price: number;
        compareAtPrice: number;
        costPrice: number;
        sku: string;
        brand: string;
        trackInventory: boolean | undefined;
        allowBackorder: boolean | undefined;
        weight: number | undefined;
        height: number | undefined;
        width: number | undefined;
        length: number | undefined;
        isActive: boolean | undefined;
        isFeatured: boolean | undefined;
        isDigital: boolean | undefined;
        downloadUrl: string | undefined;
        seoTitle: string | undefined;
        seoDescription: string | undefined;
        color: string | undefined;
        size: string | undefined;
      };
      try {
        const newProduct = await fastify.prisma.product.create({
          data: {
            optionValues: {
              color,
              size,
            },
            name,
            slug,
            description,
            price,
            compareAtPrice,
            costPrice,
            sku,
            brand,
            trackInventory,
            allowBackorder,
            weight,
            height,
            width,
            length,
            isActive,
            isFeatured,
            isDigital,
            downloadUrl,
            seoTitle,
            seoDescription,
            inventoryQuantity: parseInt(inventoryQuantity),
            categories: {
              connect: categories ?? [],
            },
            images: {
              createMany: {
                data: images ?? [],
              },
            },
          },
        });
        return reply.status(201).send(newProduct);
      } catch (error) {
        return reply.status(409).send(error);
      }
    }
  );

  //get product with reviews and discouts
  fastify.get(
    "/products-reviews-discout",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const products = await fastify.prisma.product.findMany({
          include: {
            reviews: true,
            discounts: true,
          },
        });
        return reply.send(products);
      } catch (error) {
        return reply.send(error).status(500);
      }
    }
  );

  //get product by slug
  fastify.get<{ Params: { slug: string } }>(
    "/products/:slug",
    async (request, reply) => {
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //delete product for admin user only
  fastify.delete<{ Params: { id: string } }>(
    "/products/:id",
    { preHandler: isAdminAuth },
    async (request, reply) => {
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //update product for admin only
  fastify.put<{ Params: { id: string } }>(
    "/products/:id",
    //{ preHandler: isModeratorAuth },
    async (request, reply) => {
      try {
        const productId = parseInt(request.params.id, 10);
        const {
          name,
          slug,
          description,
          price,
          compareAtPrice,
          costPrice,
          sku,
          brand,
          trackInventory,
          inventoryQuantity,
          allowBackorder,
          weight,
          height,
          width,
          length,
          isActive,
          isFeatured,
          isDigital,
          downloadUrl,
          seoTitle,
          seoDescription,
          categories,
          size,
          color,
        } = request.body as {
          categories: Array<Prisma.CategoryWhereUniqueInput>;
          inventoryQuantity: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          compareAtPrice: number;
          costPrice: number;
          sku: string;
          brand: string;
          trackInventory: boolean | undefined;
          allowBackorder: boolean | undefined;
          weight: number | undefined;
          height: number | undefined;
          width: number | undefined;
          length: number | undefined;
          isActive: boolean | undefined;
          isFeatured: boolean | undefined;
          isDigital: boolean | undefined;
          downloadUrl: string | undefined;
          seoTitle: string | undefined;
          seoDescription: string | undefined;
          size: string | undefined;
          color: string | undefined;
        };
        const updatedProduct = await fastify.prisma.product.update({
          data: {
            name,
            slug,
            description,
            price,
            compareAtPrice,
            costPrice,
            sku,
            brand,
            trackInventory,
            inventoryQuantity: parseInt(inventoryQuantity),
            allowBackorder,
            weight,
            height,
            width,
            length,
            isActive,
            isFeatured,
            isDigital,
            downloadUrl,
            seoTitle,
            seoDescription,
            optionValues: {
              color: color,
              size: size,
            },
            categories: {
              set: categories,
            },
          },
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //GET /api/products/:id/reviews - Get product reviews
  fastify.get<{ Params: { id: string } }>(
    "/products/:id/reviews",
    async (request, reply) => {
      try {
        const productId = parseInt(request.params.id, 10);
        const reviews = await fastify.prisma.review.findMany({
          where: {
            productId: productId,
          },
        });
        return reply.send(reviews);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //create review for product //authenticated user only
  fastify.post<{
    Params: { id: string };
    Body: {
      title: string;
      rating: number;
      comment: string;
    };
  }>(
    "/products/:id/reviews",
    { preHandler: isAuthenticate },
    async (request, reply) => {
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //update reviews
  fastify.put<{
    Params: { id: string };
    Body: {
      id: number;
      title: string;
      rating: number;
      comment: string;
    };
  }>(
    "/products/:id/reviews",
    { preHandler: isAuthenticate },
    async (request, reply) => {
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  fastify.delete<{
    Params: { id: string };
    Body: {
      id: number;
    };
  }>(
    "/products/:id/reviews",
    { preHandler: isModeratorAuth },
    async (request, reply) => {
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
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  fastify.get("/products/ratings/:slug", async (request, reply) => {
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
          ratingCounts[1] !== 0
            ? ((ratingCounts[i] / totalReviews) * 100).toFixed(0) + "%"
            : "0%";
      }

      return reply.send(
        new CustomResponse(
          {
            product: product,
            totalReviews: totalReviews,
            averageRating: averageRating,
            ratingCounts: ratingCounts,
            ratingPercentages: ratingPercentages,
          },
          null
        )
      );
    } catch (error) {
      return reply.send(error);
    }
  });
};
