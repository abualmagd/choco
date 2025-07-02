import { Prisma } from "@prisma/client";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse } from "../utils/responseClasses";

export const orderItemsRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //create many ordersItems
  fastify.post("/orderItems", async (request, reply) => {
    try {
      const itemsData = request.body as Prisma.OrderItemCreateManyInput;
      const orderItems = await fastify.prisma.orderItem.createMany({
        data: itemsData,
      });
      return reply.send(orderItems);
    } catch (error) {
      return reply.send(error);
    }
  });

  //create one orderItem
  fastify.post("/orderItem", async (request, reply) => {
    try {
      const itemData = request.body as Prisma.OrderItemCreateInput;
      const orderItem = await fastify.prisma.orderItem.create({
        data: itemData,
      });
      return reply.send(orderItem);
    } catch (error) {
      return reply.send(error);
    }
  });

  //update orderItem
  fastify.put("/orderItems/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const itemsData = request.body as Prisma.OrderItemUpdateInput;
      const orderItem = await fastify.prisma.orderItem.update({
        data: itemsData,
        where: { id: parseInt(id) },
      });
      return reply.send(orderItem);
    } catch (error) {
      return reply.send(error);
    }
  });

  //delete orderItem
  fastify.delete("/orderItems/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await fastify.prisma.orderItem.delete({
        where: { id: parseInt(id) },
      });
      return reply.send(new CustomResponse("order item deleted well", null));
    } catch (error) {
      return reply.send(error);
    }
  });
};
