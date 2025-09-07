import { CustomResponse } from "./../utils/responseClasses";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ResError } from "../utils/responseClasses";
import { OrderStatus, Prisma } from "@prisma/client";
import _ from "underscore";
import { createOrderInvoice } from "../services/invoiceServices";
import { createHmac } from "crypto";
import {
  isAdminAuth,
  isAuthenticate,
  isModeratorAuth,
} from "../authentication/middleware";
import queryString from "query-string";

export const orderRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //GET /api/orders - Get user's orders
  fastify.get(
    "/orders",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        if (!request.session.user?.id) {
          return reply
            .status(400)
            .send(new ResError(400, " please sign in again", " Unauthorized "));
        }
        const { page } = (request.query as { page: string }) ?? "0";
        const orders = await fastify.prisma.order.findMany({
          where: { userId: request.session.user?.id },
          skip: 20 * parseInt(page),
          take: 20,
        });
        return reply.send(orders);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //POST /api/orders - Create new order

  fastify.post("/orders", async (request, reply) => {
    try {
      const orderData = request.body as Prisma.OrderCreateInput;
      const order = await fastify.prisma.order.create({
        data: {
          orderNumber: orderData.orderNumber,
          userId: request.session.user?.id!,
          subtotal: orderData.subtotal,
          tax: orderData.tax,
          shipping: orderData.shipping,
          discount: orderData.discount,
          total: orderData.total,
          paymentMethod: orderData.paymentMethod,
        },
      });
      if (!order) {
        return reply
          .status(500)
          .send(
            new ResError(500, " error in creating order", "failed creation")
          );
      }
      return reply.send(order);
    } catch (error) {
      return reply.send(error);
    }
  });

  //GET /api/orders/:id - Get order details
  fastify.get(
    "/orders/:id",
    //{preHandler:isAuthenticate},
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const order = await fastify.prisma.order.findUnique({
          where: { id: parseInt(id) },
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        });
        if (!order) {
          return reply
            .status(500)
            .send(
              new ResError(
                500,
                ` error in getting order with id = ${id}`,
                "failed"
              )
            );
        }

        return reply.send(order);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //PUT /api/orders/:id/cancel - Cancel order
  fastify.put<{ Params: { id: string } }>(
    "/admin/orders/cancel/:id",
    async (request, reply) => {
      try {
        const { id } = request.params;
        const order = await fastify.prisma.order.update({
          where: { id: parseInt(id) },
          data: {
            status: "CANCELLED",
          },
        });

        if (!order) {
          return reply
            .status(500)
            .send(
              new ResError(
                500,
                ` error in cancelling order with id = ${id}`,
                "failed"
              )
            );
        }

        return reply.send(order);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //PUT /api/orders/:id/update order
  fastify.put<{ Params: { id: string } }>(
    "/orders/:id",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { shippingAddressId, ...data } = request.body as {
          shippingAddressId: string;
          data: any;
        };
        const order = await fastify.prisma.order.update({
          where: { id: parseInt(id) },
          data: {
            ...data,
            shippingAddressId: parseInt(shippingAddressId),
          },
        });

        if (!order) {
          return reply
            .status(500)
            .send(
              new ResError(
                500,
                ` error in updating order with id = ${id}`,
                "failed"
              )
            );
        }

        return reply.send(order);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //GET /api/orders/:id/invoice - Get order invoice
  fastify.get<{ Params: { id: string } }>(
    "/orders/:id/invoice",
    async (request, reply) => {
      try {
        if (!request.session.user?.id) {
          return reply
            .status(400)
            .send(new ResError(400, " please sign in again", " Unauthorized "));
        }

        const { id } = request.params;
        const orderInvoice = await createOrderInvoice();
        if (!orderInvoice) {
          return reply
            .status(500)
            .send(
              new ResError(500, ` error in getting orderInvoice `, "failed")
            );
        }

        return reply.send(orderInvoice);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //Admin Order Management

  // admin-moderator updating order
  fastify.put<{ Params: { id: string } }>(
    "/admin/orders/:id",
    { preHandler: isModeratorAuth },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const newData = request.body as Prisma.OrderUpdateInput;
        const order = await fastify.prisma.order.update({
          where: { id: parseInt(id) },
          data: newData,
        });

        if (!order) {
          return reply
            .status(500)
            .send(
              new ResError(
                500,
                ` error in updating order with id = ${id}`,
                "failed"
              )
            );
        }

        return reply.send(order);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //GET /api/admin/orders - List all orders (admin) with query
  fastify.get(
    "/admin/orders/query",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const query = request.query as Prisma.OrderWhereInput;
        const orders = await fastify.prisma.order.findMany({
          where: query,
        });
        return reply.send(orders);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //GET /api/admin/orders/stats - Order statistics (admin)
  fastify.get(
    "/admin/orders/stats",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { status } = request.query as any;
        const orders = await fastify.prisma.order.findMany({
          where: {
            status: status,
          },
        });
        return reply.send(orders);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //get all orders with pagination
  fastify.get(
    "/admin/orders",
    // { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { page, ...restQuery } = request.query as {
          page: string;
        };

        const orders = await fastify.prisma.order.findMany({
          skip: 20 * parseInt(page),
          take: 20,
          where: restQuery,
        });
        return reply.send(orders);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  fastify.get("hash/order/:id/currency/:currncy", async (request, replay) => {
    const { id } = request.params as { id: string };
    const { currncy } = request.params as { currncy: string };
    const order = await fastify.prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return replay
        .status(404)
        .send(new ResError(404, "not found ", " not found"));
    }

    const CustomerReference = order.userId; // Your customer ID for saving the card

    const mid = "MID-25920-522"; // Your actual merchant ID
    const amount = order.total; // Format to 2 decimal places
    const currency = currncy; // e.g., "EGP"
    const orderId = order?.id; // e.g., 99
    const secret = process.env.KASHIER_KEY;
    const path = `/?payment=${mid}.${orderId}.${amount}.${currency}${
      CustomerReference ? "." + CustomerReference : ""
    }`;

    const hash = createHmac("sha256", secret!).update(path).digest("hex");

    // The result hash for /?payment=mid-0-1.99.20.EGP with secret 11111
    // should be 606a8a1307d64caf4e2e9bb724738f115a8972c27eccb2a8acd9194c357e4bec

    return replay.send(new CustomResponse({ hash: hash }, null));
  });

  fastify.post("/order/webhook", async (request, reply) => {
    //webhook signature
    console.log("called webhook");
    const { data, event } = request.body as { data: any; event: any };
    data.signatureKeys.sort();

    const queryString = await import("query-string");

    const objectSignaturePayload = _.pick(data, data.signatureKeys);
    const signaturePayload = queryString.default.stringify(
      objectSignaturePayload
    );
    const signature = createHmac("sha256", process.env.KASHIER_KEY!)
      .update(signaturePayload)
      .digest("hex");
    const kashierSignature = request.headers["x-kashier-signature"];
    if (kashierSignature === signature) {
      console.log("valid signature");
      console.log("event: ", event);

      if (
        (event === "pay" && data.status === "SUCCESS") ||
        (event === "capture" && data.status === "SUCCESS")
      ) {
        await fastify.prisma.order.update({
          where: { id: parseInt(data.merchantOrderId) },
          data: {
            paymentStatus: "PAID",
          },
        });
      }

      return reply.status(200);
    } else {
      console.log("invalid signature");

      return reply.status(500);
    }
  });
};
