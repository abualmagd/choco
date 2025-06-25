import { FastifyPluginAsync, FastifyReply, FastifyRequest } from "fastify";

export const productRoutes: FastifyPluginAsync = async (fastify, opt: any) => {
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

  fastify.get("/prisma-check", async (request, reply) => {
    return {
      prismaExists: !!fastify.prisma,
      models: fastify.prisma ? Object.keys(fastify.prisma) : [],
    };
  });
};
