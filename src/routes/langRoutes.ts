import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { CustomResponse, ResError } from "../utils/responseClasses";
import { i18nPlugin } from "../plugins/i18n";

export const LangRoutes: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.get("/set-lang/:lang", async (request, reply) => {
    const { lang } = request.params as { lang: string };

    const supportedLngs = Object.keys(fastify.translations);

    if (supportedLngs.includes(lang)) {
      reply.setCookie("language", lang, {
        path: "/",
        maxAge: 365 * 24 * 60 * 60,
      });
    } else {
      return reply
        .send(new ResError(500, "not supported", "not supported language"))
        .status(500);
    }

    //const referer = request.headers.referer || "/";
    //return reply.redirect(referer);
    return reply.send(new CustomResponse("language changed", null));
  });
};
