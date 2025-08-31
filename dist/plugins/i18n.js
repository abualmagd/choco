"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.i18nPlugin = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
exports.i18nPlugin = (0, fastify_plugin_1.default)(async (fastify, opt) => {
    const localPath = path_1.default.join(process.cwd(), "locals");
    let translations = {};
    try {
        const files = fs_1.default.readdirSync(localPath);
        for (const file of files) {
            if (file.endsWith(".json")) {
                const lang = file.replace(".json", "");
                const content = fs_1.default.readFileSync(path_1.default.join(localPath, file), "utf8");
                translations[lang] = JSON.parse(content);
            }
        }
        fastify.decorate("translations", translations);
        fastify.decorate("getTranslations", function (lang = "en") {
            return translations[lang] || translations["en"];
        });
        fastify.decorateRequest("getUserLang", async function () {
            if (this.cookies && this.cookies.language) {
                const lang = this.cookies.language;
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
        });
    }
    catch (error) {
        console.error(error);
        throw error;
    }
});
