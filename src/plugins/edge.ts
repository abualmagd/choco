import fp from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import path from "path";
import { Edge } from "edge.js";

let edgeInstance: any = null;
let cachedSettings: Record<string, any> = {};

async function fetchSettings(fastify: FastifyInstance) {
  const siteSettings = await fastify.prisma.siteSettings.findMany();
  cachedSettings = siteSettings.reduce((obj, { key, value }) => {
    obj[key] = value;
    return obj;
  }, {} as Record<string, any>);
  return cachedSettings;
}

export const EdgePlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance, opt: any) => {
    if (!edgeInstance) {
      edgeInstance = new Edge({
        cache: false,
      });
      edgeInstance.mount(path.join(process.cwd(), "views")); // Adjust path as needed
    }

    const siteSettings = await fetchSettings(fastify);
    edgeInstance.global("settings", siteSettings);

    fastify.decorateReply(
      "view",
      async function (template: string, state?: Record<string, any>) {
        const html = await edgeInstance.render(template, state);
        this.header("content-type", "text/html; charset=utf-8");
        this.send(html);
      }
    );

    fastify.decorate("refreshSiteSettings", async () => {
      const newSiteSettings = await fetchSettings(fastify);
      edgeInstance.global("settings", newSiteSettings);
      return newSiteSettings;
    });
  }
);
