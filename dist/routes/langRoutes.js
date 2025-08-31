"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LangRoutes = void 0;
const responseClasses_1 = require("../utils/responseClasses");
const i18n_1 = require("../plugins/i18n");
const LangRoutes = async (fastify, opt) => {
    fastify.get("/set-lang/:lang", async (request, reply) => {
        const { lang } = request.params;
        const supportedLngs = Object.keys(fastify.translations);
        fastify.register(i18n_1.i18nPlugin);
        if (supportedLngs.includes(lang)) {
            reply.setCookie("language", lang, {
                path: "/",
                maxAge: 365 * 24 * 60 * 60,
            });
        }
        else {
            return reply
                .send(new responseClasses_1.ResError(500, "not supported", "not supported language"))
                .status(500);
        }
        const referer = request.headers.referer || "/";
        return reply.redirect(referer);
    });
};
exports.LangRoutes = LangRoutes;
