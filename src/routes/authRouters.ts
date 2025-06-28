import { fastifyOauth2 } from "@fastify/oauth2";
import { hashPassword } from "./../authentication/auth";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { verifyPassword } from "../authentication/auth";

export const authRouters: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };
    try {
      const user = await fastify.prisma.user.findUnique({
        where: {
          email: email,
        },
        include: {
          sessions: true,
        },
      });
      if (!user || !(await verifyPassword(password, user.password))) {
        reply.status(401).send({
          error: "invalid",
          message: "Invalid Credintials",
          code: 401,
        });
      }

      // ✅ Create the session
      request.session.user = {
        id: user?.id!,
        username: user?.name ?? undefined,
        email: user?.email,
        role: user?.role ?? "user",
      };

      reply.send({ success: true, message: "Logged in successfully" });
    } catch (error) {
      reply.send(error);
    }
  });

  //register then login
  fastify.post("/register", async (request, reply) => {
    try {
      const { email, password, name, phone } = request.body as {
        email: string;
        password: string;
        name: string;
        phone: string;
      };
      const user = await fastify.prisma.user.create({
        data: {
          email: email,
          password: await hashPassword(password),
          name: name,
          phone: phone,
        },
      });
      if (user) {
        // ✅ Create the session
        request.session.user = {
          id: user?.id!,
          username: user?.name ?? undefined,
          email: user?.email,
          role: user?.role ?? "user",
        };

        reply.send({ success: true, message: "Registered in successfully" });
      }

      reply.status(500).send({
        error: "server error",
        message: "Registering failed",
        code: 500,
      });
    } catch (error) {
      reply.send(error);
    }
  });

  fastify.post("login/:provider", async (request, reply) => {
    const provider = request.params;
    switch (provider) {
      case "google":
        fastify.googleOAuth2.generateAuthorizationUri(
          request,
          reply,
          (err, authorizationEndpoint) => {
            if (err) reply.send(err);
            reply.redirect(authorizationEndpoint);
          }
        );
        break;

      case "facebook":
        fastify.facebookOAuth2.generateAuthorizationUri(
          request,
          reply,
          (err, authorizationEndpoint) => {
            if (err) reply.send(err);
            reply.redirect(authorizationEndpoint);
          }
        );
        break;
      default:
        break;
    }
  });
};
