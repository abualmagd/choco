import { Prisma } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse, ResError } from "../utils/responseClasses";
import { hashPassword } from "../authentication/auth";
import { isAuthenticate } from "../authentication/middleware";

export const cartRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //GET /api/cart - Get user's cart
  fastify.get("/cart", async (request, reply) => {
    try {
      if (!request.session.user?.id) {
        return reply
          .status(400)
          .send(new ResError(400, " please sign in again", " Unauthorized "));
      }
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

  //get cart total
  fastify.get(
    "/cart/total",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      const id = request.session.user?.id;
      const cartItems = await fastify.prisma.cart.findUnique({
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
      let total = 0;
      if (cartItems) {
        for (let i = 0; i < cartItems.items.length; i++) {
          const activeDiscount: any = await fastify.prisma.$queryRaw`
            SELECT * FROM Discount d
            JOIN _discounttoproduct dp ON d.id = dp.A
            WHERE dp.B = ${
              cartItems.items[i].product.id ??
              cartItems.items[i].variant?.productId
            }
            AND d.isActive = true
            AND (d.maxUses IS NULL OR d.maxUses > d.usedCount)
            LIMIT 1
          `;

          const price =
            cartItems.items[i].quantity *
            Number(
              cartItems.items[i].product?.price ??
                cartItems.items[i].variant?.price
            );

          const discountValue = activeDiscount[0]?.value
            ? Number(activeDiscount[0].value)
            : 0;
          console.log("disccount: ", activeDiscount[0]?.value);
          total += price * (1 - discountValue / 100);
        }

        return reply.send(
          new CustomResponse(
            {
              total: total,
            },
            null
          )
        );
      }
    }
  );

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

        //check valid stock or not
        const item = await fastify.prisma.cartItem.findUnique({
          where: { id: parseInt(itemId) },
          include: {
            product: true,
            variant: true,
          },
        });
        if (item?.product) {
          if (item.product.inventoryQuantity < parseInt(quantity)) {
            return reply
              .status(500)
              .send(new ResError(500, "invalid stock", "ivalid stock"));
          }
        } else {
          if (item?.variant?.inventoryQuantity ?? 0 < parseInt(quantity)) {
            return reply
              .status(500)
              .send(new ResError(500, "invalid stock", "ivalid stock"));
          }
        }

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
      //user didnot registered
      if (!request.session.user) {
        const anonymousEmail = `anon_${request.ip.replace(
          /\./g,
          "-"
        )}@anon.com`;

        const user = await fastify.prisma.user.create({
          data: {
            email: anonymousEmail,
            password: await hashPassword(request.ip + Date.now()), // More unique
            name: "Anonymous",
            phone: null,
          },
        });

        request.session.user = {
          id: user.id,
          email: user.email,
        };

        await request.session.save();
      }

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
      if (!request.session.user?.id) {
        return reply
          .status(400)
          .send(new ResError(400, " please sign in again", " Unauthorized "));
      }
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
