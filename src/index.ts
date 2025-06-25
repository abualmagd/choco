import fastify from "fastify";
import dotenv from "dotenv";
import { productRoutes } from "./routes/productRoutes";
import { prismaPlug } from "./plugins/prisma";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const server = fastify({
  logger: true,
});

const start = async () => {
  try {
    const prisma = new PrismaClient();
    await prisma.$connect();

    server.decorate("prisma", prisma);

    server.addHook("onClose", async (server) => {
      await server.prisma.$disconnect();
    });

    await server.register(productRoutes, { prefix: "/api/" });

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
