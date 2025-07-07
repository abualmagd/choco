import fastify from "fastify";
import dotenv from "dotenv";
import { productRoutes } from "./routes/productRoutes";
import prismaPlugin from "./plugins/prisma";
import fastifyCookie from "@fastify/cookie";
import fastifySession from "@fastify/session";
import {
  oauthFaceBookOption,
  oauthGoogleOption,
  sessionOption,
} from "./authentication/auth";
import fastifyOauth2 from "@fastify/oauth2";
import { authRouters } from "./routes/authRoutes";
import { categoryRoutes } from "./routes/categoryRoutes";
import { variantRoutes } from "./routes/variantRoutes";
import { cartRoutes } from "./routes/cartRoutes";
import { orderRoutes } from "./routes/orderRoutes";
import { orderItemsRoutes } from "./routes/orderItems";
import { wishItemsRoutes } from "./routes/wishlistItems";
import { discountRoutes } from "./routes/discountRoutes";
import { viewRoutes } from "./routes/viewRoutes";
import { EdgePlugin } from "./plugins/edge";
import path from "path";

dotenv.config();

const server = fastify({
  logger: true,
});

const start = async () => {
  try {
    await server.register(prismaPlugin);
    await server.register(productRoutes, { prefix: "/api/" });
    await server.register(categoryRoutes, { prefix: "/api/" });
    await server.register(variantRoutes, { prefix: "/api/" });
    await server.register(cartRoutes, { prefix: "/api/" });
    await server.register(orderRoutes, { prefix: "/api/" });
    await server.register(orderItemsRoutes, { prefix: "/api/" });
    await server.register(wishItemsRoutes, { prefix: "/api/" });
    await server.register(discountRoutes, { prefix: "/api/" });
    await server.register(viewRoutes);

    /*server.decorateReply(
      "view",
      async function (template: string, state?: Record<string, any>) {
        const { Edge } = await import("edge.js");
        const edge = Edge.create();
        edge.mount(path.join(__dirname, "./views"));
        const html = edge.render(template, state);
        this.header("content-type", "text/html; charset=utf-8");
        this.send(html);
      }
    );*/

    await server.register(EdgePlugin);

    await server.register(fastifyCookie);
    await server.register(fastifySession, sessionOption);
    await server.register(fastifyOauth2, oauthGoogleOption);
    await server.register(fastifyOauth2, oauthFaceBookOption);
    await server.register(authRouters, {
      prefix: "/api/auth/",
    });
    server.log.info(`Prisma available: ${!!server.prisma}`);

    const myPort: number = Number(process.env.MY_PORT) || 5445;
    server.listen({ port: myPort }, (err, adress) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log("server listening at ", adress);
    });

    server.get("/", (request, reply) => {
      return reply.send("hello from my choco");
    });
  } catch (error) {}
};

start();
