import { Prisma } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse, ResError } from "../utils/responseClasses";
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
        const { productId } = request.body as { productId: string };
        const wishlistitem = await fastify.prisma.wishlistItem.create({
          data: {
            userId: request.session.user?.id!,
            productId: parseInt(productId),
          },
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

  //delete wishlist item
  fastify.delete(
    "/wishItems/product/:id",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.session.user?.id;
        const item = await fastify.prisma.wishlistItem.findFirst({
          where: {
            OR: [{ productId: parseInt(id) }, { variantId: parseInt(id) }],
            userId: userId,
          },
        });
        console.log("userId", id);
        if (item) {
          await fastify.prisma.wishlistItem.delete({
            where: { id: item!.id },
          });
        } else {
          return reply.send(
            new ResError(404, "not found", "error in removing from wishlist")
          );
        }

        return reply.send(
          new CustomResponse("wishlist item deleted well", null)
        );
      } catch (error) {
        return reply.send(error);
      }
    }
  );
};
