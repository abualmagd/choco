import { CustomResponse } from "./../utils/responseClasses";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { isAdminAuth } from "../authentication/middleware";
import { Prisma } from "@prisma/client";
import { ResError } from "../utils/responseClasses";

export const variantRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  ///api/products/:id/variants - Create variant (admin)
  fastify.post<{ Params: { id: string } }>(
    "/products/:id/variants",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const bodyData = request.body as Prisma.ProductVariantCreateInput;
        const variant = await fastify.prisma.productVariant.create({
          data: {
            ...bodyData,
            product: {
              connect: { id: parseInt(id) },
            },
          },
        });
        if (!variant) {
          return reply
            .status(500)
            .send(new ResError(500, "creation failed", "error in creation"));
        }
        return reply.send(variant);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  ///api/products/:id/variants - Get variant of an product
  fastify.get<{ Params: { id: string } }>(
    "/products/:id/variants",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const variants = await fastify.prisma.productVariant.findMany({
          where: { productId: parseInt(id) },
        });
        if (!variants) {
          return reply
            .status(404)
            .send(
              new ResError(
                404,
                `not found variant for product has id ${id}`,
                "not found"
              )
            );
        }
        return reply.send(variants);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //api/products/variants/:variantId - Update variant (admin)
  fastify.put<{ Params: { id: string } }>(
    "/products/variants/:id",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const bodyData = request.body as Prisma.ProductVariantCreateInput;
        const variant = await fastify.prisma.productVariant.update({
          where: { id: parseInt(id) },
          data: bodyData,
        });
        if (!variant) {
          return reply
            .status(500)
            .send(new ResError(500, "creation failed", "error in creation"));
        }
        return reply.send(variant);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  ///api/products/:id/variants/:variantId - Delete variant (admin)
  fastify.delete<{ Params: { id: string } }>(
    "/products/variants/:id",
    async (request, reply) => {
      try {
        const { id } = request.params;
        await fastify.prisma.productVariant.delete({
          where: { id: parseInt(id) },
        });
        reply
          .status(200)
          .send(new CustomResponse("deleted successfully", null));
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //get variants details
  fastify.get<{ Params: { id: string } }>(
    "/products/variants/:id",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { id } = request.params;
        const variant = await fastify.prisma.productVariant.findUnique({
          where: { id: parseInt(id) },
        });
        if (!variant) {
          return reply
            .status(500)
            .send(
              new ResError(404, `not found product by id ${id}`, "not found")
            );
        }
        return reply.send(variant);
      } catch (error) {
        reply.send(error);
      }
    }
  );
};
