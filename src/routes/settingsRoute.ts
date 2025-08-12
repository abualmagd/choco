import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { isAdminAuth } from "../authentication/middleware";
import { Prisma } from "@prisma/client";
import { CustomResponse } from "../utils/responseClasses";

export const SettingsRoute: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //get all settings
  fastify.get(
    "/admin/settings",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const setts = await fastify.prisma.siteSettings.findMany();
        return reply.send(setts);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //create settings keys, value
  fastify.post(
    "/admin/settings",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const body = request.body as Prisma.SiteSettingsCreateInput;
        const setts = await fastify.prisma.siteSettings.createMany({
          data: body,
        });
        fastify.refreshSiteSettings();
        return reply.send(setts);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //update settings keys
  fastify.put(
    "/admin/settings",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { key, value } = request.body as { key: string; value: string };
        const setts = await fastify.prisma.siteSettings.update({
          data: {
            value: value,
          },
          where: {
            key: key,
          },
        });
        fastify.refreshSiteSettings();
        return reply.send(setts);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //delete settings
  fastify.delete(
    "/admin/settings",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { key } = request.body as { key: string };
        await fastify.prisma.siteSettings.delete({
          where: {
            key,
          },
        });
        fastify.refreshSiteSettings();
        return reply.send(new CustomResponse("key deleted", null));
      } catch (error) {
        return reply.send(error);
      }
    }
  );
};
