import fastify from "fastify";
import dotenv from "dotenv";
import { productRoutes } from "./routes/productRoutes";
import prismaPlugin from "./plugins/prisma";

dotenv.config();

const server = fastify({
  logger: true,
});

const start = async () => {
  try {
    await server.register(prismaPlugin);
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
