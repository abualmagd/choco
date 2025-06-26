import { Prisma } from "@prisma/client";
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export const productRoutes: FastifyPluginAsync = async (fastify, opt: any) => {
  //get list of products
  fastify.get(
    "/products",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const products = await fastify.prisma.product.findMany();
        reply.send({ data: products });
      } catch (error) {
        reply.send(error).status(500);
      }
    }
  );

  //create one product must be admin
  fastify.post("/products", async (request, reply) => {
    try {
      const newProduct = await fastify.prisma.product.create({
        data: request.body as Prisma.ProductCreateInput,
      });
      reply.status(201).send(newProduct);
    } catch (error) {
      reply.status(409).send(error);
    }
  });

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
        reply.send({ data: products });
      } catch (error) {
        reply.send(error).status(500);
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
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //delete product for admin user only
  fastify.delete<{ Params: { id: string } }>(
    "/products/:id",
    async (request, reply) => {
      try {
        const productId = parseInt(request.params.id, 10);
        await fastify.prisma.product.delete({
          where: {
            id: productId,
          },
        });
        reply.send({
          data: `product with id=${request.params.id} deleted successfully`,
        });
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //update product for admin only
  fastify.put<{ Params: { id: string } }>(
    "/products/:id",
    async (request, reply) => {
      try {
        const productId = parseInt(request.params.id, 10);
        const updatedData = (await request.body) as Prisma.ProductUpdateInput;
        const updatedProduct = await fastify.prisma.product.update({
          data: updatedData,
          where: {
            id: productId,
          },
        });
        reply.send(updatedProduct);
      } catch (error) {
        reply.send(error);
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
        reply.send(reviews);
      } catch (error) {
        reply.send(error);
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
  }>("/products/:id/reviews", async (request, reply) => {
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
              firstName: true,
              avatar: true,
            },
          },
        },
      });
      reply.send(newReview);
    } catch (error) {
      reply.send(error);
    }
  });
};
