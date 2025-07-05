import { FastifyInstance, FastifyPluginAsync, FastifyReply } from "fastify";

export const viewRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.get("/home", async (request, reply: FastifyReply) => {
    try {
      return reply.view("home", { username: "Ismail" });
    } catch (error) {
      return reply.send(error);
    }
  });

  fastify.get("/product/:slug", async (request, reply) => {
    return "view here product page";
  });
};
