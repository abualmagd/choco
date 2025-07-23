import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ResError } from "../utils/responseClasses";
import { isAuthenticate } from "../authentication/middleware";

export const userRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.post(
    "user/update/:id",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = request.body as any;

        const user = await fastify.prisma.user.update({
          where: { id: parseInt(id) },
          data: data,
        });
        if (!user) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to update user", "failed"));
        }
        return reply.send(user);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  fastify.get("user/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const user = await fastify.prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          addresses: true,
        },
      });
      if (!user) {
        return reply
          .status(500)
          .send(new ResError(500, "failed to find user", "failed"));
      }
      return reply.send(user);
    } catch (error) {
      reply.send(error);
    }
  });

  //add new address
  fastify.post(
    "user/address",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const id = request.session?.user?.id;
        const data = request.body as any;

        const address = await fastify.prisma.address.create({
          data: {
            userId: id,
            ...data,
          },
        });
        if (!address) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to add address", "failed"));
        }
        return reply.send(address);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //add new address
  fastify.put(
    "user/address",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const data = request.body as any;

        const address = await fastify.prisma.address.update({
          where: { id: data.id },
          data: data,
        });
        if (!address) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to add address", "failed"));
        }
        return reply.send(address);
      } catch (error) {
        reply.send(error);
      }
    }
  );
};
