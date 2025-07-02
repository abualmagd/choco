import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ResError } from "../utils/responseClasses";
import { OrderStatus, Prisma } from "@prisma/client";
import { createOrderInvoice } from "../services/invoiceServices";
import { isAdminAuth, isModeratorAuth } from "../authentication/middleware";

export const orderRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //GET /api/orders - Get user's orders
  fastify.get("/orders", async (request, reply) => {
    try {
      if (!request.session.user?.id) {
        return reply
          .status(400)
          .send(new ResError(400, " please sign in again", " Unauthorized "));
      }

      const orders = await fastify.prisma.order.findMany({
        where: { userId: request.session.user?.id },
      });
      return reply.send(orders);
    } catch (error) {
      return reply.send(error);
    }
  });

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
  fastify.get<{ Params: { id: string } }>(
    "/orders/:id",
    async (request, reply) => {
      try {
        if (!request.session.user?.id) {
          return reply
            .status(400)
            .send(new ResError(400, " please sign in again", " Unauthorized "));
        }

        const { id } = request.params;
        const order = await fastify.prisma.order.findUnique({
          where: { id: parseInt(id) },
          include: {
            items: true,
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
    "/orders/:id",
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

  //GET /api/admin/orders - List all orders (admin)
  fastify.get(
    "/admin/orders",
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
};
