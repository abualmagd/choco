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
    }
  );

  fastify.delete<{ Params: { id: BigInteger } }>(
    "/products/:id",
    async (request, reply) => {}
  );
};
