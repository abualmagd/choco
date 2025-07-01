import { Prisma } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse, ResError } from "../utils/responseClasses";

export const cartRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //GET /api/cart - Get user's cart
  fastify.get("/cart", async (request, reply) => {
    try {
      const cart = await fastify.prisma.cart.findUnique({
        where: { userId: request.session.user?.id },
        include: {
          items: true,
        },
      });
      return reply.send(cart);
    } catch (error) {
      return reply.send(error);
    }
  });

  //create cart for user
  fastify.post("/cart", async (request, reply) => {
    try {
      const cart = await fastify.prisma.cart.create({
        data: {
          userId: request.session.user?.id!,
        },
      });
      return reply.send(cart);
    } catch (error) {
      return reply.send(error);
    }
  });

  //update item quantity
  fastify.put<{ Params: { itemId: string } }>(
    "/cart/:itemId",
    async (request, reply) => {
      try {
        const { itemId } = request.params;
        const { quantity } = request.query as { quantity: string };
        const cartItem = await fastify.prisma.cartItem.update({
          where: { id: parseInt(itemId) },
          data: {
            quantity: parseInt(quantity),
          },
        });

        return reply.send(cartItem);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //add item to cart (create item)
  fastify.post("/cart/add", async (request, reply) => {
    try {
      let userCart;
      userCart = await fastify.prisma.cart.findUnique({
        where: { userId: request.session.user?.id },
      });
      if (!userCart) {
        userCart = await fastify.prisma.cart.create({
          data: {
            userId: request.session.user?.id!,
          },
        });
      }
      const { productId, variantId } = request.body as {
        productId: number;
        variantId: number;
      };
      const cartItem = await fastify.prisma.cartItem.create({
        data: {
          productId: productId,
          cartId: userCart.id!,
          variantId: variantId,
        },
        include: {
          cart: true,
        },
      });

      return reply.send(cartItem);
    } catch (error) {
      return reply.send(error);
    }
  });

  ///api/cart/:itemId - Remove item from cart
  fastify.delete<{ Params: { itemId: string } }>(
    "/cart/:itemId",
    async (request, reply) => {
      try {
        const { itemId } = request.params;
        await fastify.prisma.cartItem.delete({
          where: { id: parseInt(itemId) },
        });
        return reply
          .send(new CustomResponse("item deleted well", null))
          .status(200);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  ///api/cart - Clear cart
  fastify.put("/cart/clear", async (request, reply) => {
    try {
      const cart = await fastify.prisma.cart.findUnique({
        where: { userId: request.session.user?.id },
      });
      if (!cart) {
        return reply.send(
          new ResError(500, "error in clearing cart", " cart clear error")
        );
      }
      await fastify.prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return reply
        .status(200)
        .send(new CustomResponse(" cart cleared well", null));
    } catch (error) {
      return reply.send(error);
    }
  });
};
