import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { ResError } from "../utils/responseClasses";
import { isAdminAuth, isAuthenticate } from "../authentication/middleware";
import { hashPassword } from "../authentication/auth";
import { Role } from "@prisma/client";

export const userRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  //update user by id
  fastify.post(
    "user/update/:id",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const data = request.body as any;

        const user = await fastify.prisma.user.update({
          where: { id: parseInt(id) },
          data: data,
        });
        if (!user) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to update user", "failed"));
        }
        return reply.send(user);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //get user by id
  fastify.get("user/:id", async (request, reply) => {
    try {
      const { id } = request.params as { id: string };

      const user = await fastify.prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          addresses: true,
        },
      });
      if (!user) {
        return reply
          .status(500)
          .send(new ResError(500, "failed to find user", "failed"));
      }
      return reply.send(user);
    } catch (error) {
      reply.send(error);
    }
  });

  //add new address
  fastify.post(
    "user/address",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const id = request.session?.user?.id;
        const data = request.body as any;

        const address = await fastify.prisma.address.create({
          data: {
            userId: id,
            ...data,
          },
        });
        if (!address) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to add address", "failed"));
        }
        return reply.send(address);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //add new address
  fastify.put(
    "user/address",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      try {
        const data = request.body as any;

        const address = await fastify.prisma.address.update({
          where: { id: data.id },
          data: data,
        });
        if (!address) {
          return reply
            .status(500)
            .send(new ResError(500, "failed to add address", "failed"));
        }
        return reply.send(address);
      } catch (error) {
        reply.send(error);
      }
    }
  );

  //create user by admin
  fastify.post(
    "user/create",
    //{ preHandler: isAdminAuth },
    async (request, reply) => {
      try {
        const { email, password, name, phone, role } = request.body as {
          email: string;
          password: string;
          name: string;
          phone: string;
          role: string;
        };
        const user = await fastify.prisma.user.create({
          data: {
            email: email,
            password: await hashPassword(password),
            name: name,
            phone: phone,
            role: role as Role,
          },
        });
        if (user) {
          return reply.send({
            success: true,
            message: "Created user successfully",
          });
        }

        return reply.status(500).send({
          error: "server error",
          message: "Create user failed",
          code: 500,
        });
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //get all users with pagination
  fastify.get("users", { preHandler: isAdminAuth }, async (request, reply) => {
    try {
      const { page } = (request.query as { page: string }) ?? "0";

      const user = await fastify.prisma.user.findMany({
        take: 20,
        skip: 20 * parseInt(page),
      });
      if (!user) {
        return reply
          .status(500)
          .send(new ResError(500, "failed to find user", "failed"));
      }
      return reply.send(user);
    } catch (error) {
      reply.send(error);
    }
  });
};
