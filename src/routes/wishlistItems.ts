import { Prisma } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse } from "../utils/responseClasses";
import { isAuthenticate } from "../authentication/middleware";

export const wishItemsRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //get wishlist items
  fastify.get(
    "/wishItems",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const wishItems = await fastify.prisma.wishlistItem.findMany({
          where: { userId: request.session.user?.id },
        });
        return reply.send(wishItems);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //create (add) one wishlistitem
  fastify.post(
    "/wishItems",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const itemData = request.body as Prisma.WishlistItemCreateInput;
        const wishlistitem = await fastify.prisma.wishlistItem.create({
          data: itemData,
        });
        return reply.send(wishlistitem);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //delete wishlist item
  fastify.delete("/wishItems/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await fastify.prisma.wishlistItem.delete({
        where: { id: parseInt(id) },
      });
      return reply.send(new CustomResponse("wishlist item deleted well", null));
    } catch (error) {
      return reply.send(error);
    }
  });
};
