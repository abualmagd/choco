import { FastifyInstance, FastifyPluginAsync, FastifyRequest } from "fastify";
import path from "path";
import fs from "fs";
import { Translations } from "../types/fastify-session";
import fp from "fastify-plugin";

export const i18nPlugin: FastifyPluginAsync = fp(
  async (fastify: FastifyInstance, opt: any) => {
    const localPath = path.join(process.cwd(), "locals");
    let translations: Translations = {};
    try {
      const files = fs.readdirSync(localPath);
      for (const file of files) {
        if (file.endsWith(".json")) {
          const lang = file.replace(".json", "");
          const content = fs.readFileSync(path.join(localPath, file), "utf8");
          translations[lang] = JSON.parse(content);
        }
      }

      fastify.decorate("translations", translations);

      fastify.decorate("getTranslations", function (lang = "en") {
        return translations[lang] || translations["en"];
      });

      fastify.decorateRequest(
        "getUserLang",
        async function (this: FastifyRequest) {
          if (this.cookies && this.cookies.language) {
            const lang = this.cookies.language as string;
            if (translations[lang]) {
              return lang;
            }
          }
          const acceptLanguage = this.headers["accept-language"];
          if (acceptLanguage) {
            const preferdLang = acceptLanguage.split(",")[0].split("-")[0];
            if (translations[preferdLang]) {
              return preferdLang;
            }
          }
          return "en";
        }
      );
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
);
