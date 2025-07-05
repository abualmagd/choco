import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import path from "path";
import { Edge } from "edge.js";

let edgeInstance: any = null;
export const EdgePlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance, opt: any) => {
    if (!edgeInstance) {
      edgeInstance = new Edge({
        cache: true,
      });
      edgeInstance.mount(path.join(process.cwd(), "views")); // Adjust path as needed
    }

    fastify.decorateReply(
      "view",
      async function (template: string, state?: Record<string, any>) {
        const html = await edgeInstance.render(template, state);
        this.header("content-type", "text/html; charset=utf-8");
        this.send(html);
      }
    );
  }
);
