import fastify, { FastifyRequest } from "fastify";
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
import fastifyCors from "@fastify/cors";
import fastifyRateLimit from "@fastify/rate-limit";
import { ResError } from "./utils/responseClasses";
import { userRoutes } from "./routes/userRoutes";
import { FileRoutes } from "./routes/fileRoutes";
import fastifyMultipart from "fastify-multipart";

dotenv.config();

const server = fastify({
  logger: true,
});

const start = async () => {
  try {
    await server.register(fastifyCors, {
      origin: [" http://[::1]:3000", "http://localhost:5173"],
      methods: ["GET", "POST", "DELETE", "PUT"],
      allowedHeaders: ["Content-Type", "Authorization", "X-API-KEY"],
      credentials: true,
    });

    await server.register(fastifyRateLimit, {
      global: true,
      max: 100,
      timeWindow: 60000,
      ban: 5,
      cache: 10000,
      keyGenerator(req: FastifyRequest) {
        return (req.headers["x-api-key"] as string) || req.ip;
      },
    });

    /*await server.register(fastifyHelmet, {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
        },
      },
    });*/

    await server.register(require("@fastify/static"), {
      root: path.join(process.cwd(), "public"),
      prefix: "/public/", // optional: default '/'
    });

    await server.register(fastifyMultipart, {
      limits: {
        fileSize: Number(process.env.MAX_FILE_SIZE),
        files: 10,
      },
    });
    await server.register(prismaPlugin);
    await server.register(productRoutes, { prefix: "/api/" });
    await server.register(categoryRoutes, { prefix: "/api/" });
    await server.register(variantRoutes, { prefix: "/api/" });
    await server.register(cartRoutes, { prefix: "/api/" });
    await server.register(orderRoutes, { prefix: "/api/" });
    await server.register(orderItemsRoutes, { prefix: "/api/" });
    await server.register(wishItemsRoutes, { prefix: "/api/" });
    await server.register(discountRoutes, { prefix: "/api/" });
    await server.register(userRoutes, { prefix: "/api/" });
    await server.register(FileRoutes, { prefix: "/api/" });
    await server.register(viewRoutes);
    await server.register(EdgePlugin);
    await server.register(fastifyCookie);
    await server.register(fastifySession, sessionOption);
    await server.register(fastifyOauth2, oauthGoogleOption);
    await server.register(fastifyOauth2, oauthFaceBookOption);
    await server.register(authRouters, {
      prefix: "/api/auth/",
    });

    server.addHook("onRequest", async (request, reply) => {
      const apiKey = request.headers["x-api-key"] as string;
      const validKeys = new Set([process.env.API_KEY_1, process.env.API_KEY_2]);

      if (request.url.startsWith("/api")) {
        if (!apiKey || !validKeys.has(apiKey)) {
          return reply
            .status(401)
            .send(
              new ResError(
                401,
                "Invalid or missing API key",
                "unauthorized call"
              )
            );
        }
      } else {
        return;
      }
    });

    const myPort: number = Number(process.env.MY_PORT) || 5445;
    server.listen({ port: myPort }, (err, adress) => {
      if (err) {
        console.log(err);
        process.exit(1);
      }
      console.log("server listening at ", adress);
    });
  } catch (error) {}
};

start();
