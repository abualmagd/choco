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
        const settings = setts.reduce((obj, { key, value }) => {
          obj[key] = value;
          return obj;
        }, {} as Record<string, any>);
        return reply.send(settings);
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

  //update settings key
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

  //update many settings keys
  fastify.put(
    "/admin/settings/many",
    { preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        // const { key, value } = request.body as { key: string; value: string };
        const data = request.body as Array<{ key: string; value: string }>;

        let setts = {};
        for (let index = 0; index < data.length; index++) {
          const setting = await fastify.prisma.siteSettings.update({
            data: {
              value: data[index].value,
            },
            where: {
              key: data[index].key,
            },
          });
          setts = { ...setts, setting };
        }
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
