import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { isAdminAuth } from "../authentication/middleware";
import { ResError } from "../utils/responseClasses";

export const categoryRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  option: any
) => {
  //get all categories
  fastify.get("/categories", async (request, reply) => {
    try {
      const categories = await fastify.prisma.category.findMany();
      return reply.send(categories);
    } catch (error) {
      return reply.send(error);
    }
  });

  //create category
  fastify.post<{
    Body: {
      slug: string;
      name: string;
      description: string;
      image: string;
      isActive: boolean;
      parentId: number;
    };
  }>("/categories", { preHandler: isAdminAuth }, async (request, reply) => {
    try {
      const { slug, name, description, image, isActive, parentId } =
        request.body;
      const categories = await fastify.prisma.category.create({
        data: {
          slug: slug,
          name: name,
          description: description,
          image: image,
          isActive: isActive ?? true,
          parentId: parentId ?? null,
        },
      });
      return reply.send(categories);
    } catch (error) {
      return reply.send(error);
    }
  });

  //update category
  fastify.put<{
    Body: {
      slug: string;
      name: string;
      description: string;
      image: string;
      isActive: boolean;
      parentId: number;
    };
    Params: { id: string };
  }>("/categories/:id", { preHandler: isAdminAuth }, async (request, reply) => {
    try {
      const { slug, name, description, image, isActive, parentId } =
        request.body;
      const { id } = request.params;
      const category = await fastify.prisma.category.update({
        where: { id: parseInt(id) },
        data: {
          slug: slug,
          name: name,
          description: description,
          image: image,
          isActive: isActive,
          parentId: parentId,
        },
      });
      return reply.send(category);
    } catch (error) {
      return reply.send(error);
    }
  });

  //delete category
  fastify.delete<{ Params: { id: number } }>(
    "/categories/:id",
    async (request, reply) => {
      try {
        const { id } = request.params;
        await fastify.prisma.category.delete({
          where: { id: id },
        });
        const res: MyResponse = {
          data: `category with id $${id} was deleted`,
          error: null,
        };

        return reply.send(res);
      } catch (error) {
        return reply.send(error);
      }
    }
  );

  //get category products with pagination
  fastify.get<{
    Params: { slug: string };
  }>("/categories/:slug/products", async (request, reply) => {
    try {
      const { slug } = request.params;
      const { page, pagesize } = request.query as {
        page: string;
        pagesize: string;
      };
      const skip = page ? (parseInt(page) - 1) * parseInt(pagesize ?? "10") : 0;
      const category = await fastify.prisma.category.findUnique({
        where: {
          slug: slug,
        },
        include: {
          products: {
            skip: skip,
            take: pagesize ? parseInt(pagesize) : 10,
            orderBy: {
              createdAt: "desc",
            },
          },
        },
      });
      if (!category) {
        return reply
          .status(404)
          .send(
            new ResError(404, "no category has this slug", "not found category")
          );
      }

      return reply.send(category);
    } catch (error) {
      return reply.send(error);
    }
  });

  //get an category
  fastify.get<{
    Params: { id: string };
  }>("/categories/:id", async (request, reply) => {
    try {
      const { id } = request.params;
      const category = await fastify.prisma.category.findUnique({
        where: {
          id: parseInt(id),
        },
      });
      if (!category) {
        return reply
          .status(404)
          .send(
            new ResError(404, "no category has this id", "not found category")
          );
      }

      return reply.send(category);
    } catch (error) {
      return reply.send(error);
    }
  });
};
