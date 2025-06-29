"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.hashPassword = exports.oauthFaceBookOption = exports.oauthGoogleOption = exports.sessionOption = void 0;
const oauth2_1 = __importDefault(require("@fastify/oauth2"));
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
exports.sessionOption = {
    secret: process.env.SESSION_SECRET || "hsgshgsbcbhcsbshbvshxkanxknzkjsbxhgbghvcxs",
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 86400000 * 7, // 1 day
    },
    cookieName: "sessionId",
    store: {
        async set(sessionId, session, callback) {
            var _a;
            try {
                if ((_a = session.user) === null || _a === void 0 ? void 0 : _a.id) {
                    await prisma.session.upsert({
                        where: { id: sessionId },
                        update: {
                            expiresAt: new Date(Date.now() + 86400000 * 7),
                            userId: session.user.id,
                        },
                        create: {
                            id: sessionId,
                            expiresAt: new Date(Date.now() + 86400000 * 7),
                            userId: session.user.id,
                        },
                    });
                    callback();
                }
                callback();
            }
            catch (error) {
                callback(error);
            }
        },
        async get(sessionId, callback) {
            var _a;
            try {
                const session = await prisma.session.findUnique({
                    where: {
                        id: sessionId,
                    },
                    include: {
                        user: true,
                    },
                });
                const typedSession = {
                    id: sessionId,
                    expiresAt: session === null || session === void 0 ? void 0 : session.expiresAt,
                    userId: (_a = session === null || session === void 0 ? void 0 : session.user) === null || _a === void 0 ? void 0 : _a.id,
                    user: {
                        id: session === null || session === void 0 ? void 0 : session.userId,
                        username: session === null || session === void 0 ? void 0 : session.user.name,
                        email: session === null || session === void 0 ? void 0 : session.user.name,
                        role: session === null || session === void 0 ? void 0 : session.user.role,
                    },
                    cookie: {
                        originalMaxAge: 86400000,
                        expires: session === null || session === void 0 ? void 0 : session.expiresAt,
                        secure: process.env.NODE_ENV === "production",
                        httpOnly: true,
                        path: "/",
                        sameSite: "lax",
                        maxAge: undefined,
                        signed: undefined,
                        domain: undefined,
                    },
                };
                callback(null, typedSession);
            }
            catch (error) {
                callback(null);
            }
        },
        async destroy(sessionId, callback) {
            try {
                await prisma.session.delete({
                    where: {
                        id: sessionId,
                    },
                });
                callback();
            }
            catch (error) {
                callback(error);
            }
        },
    },
};
exports.oauthGoogleOption = {
    name: "googleOAuth2",
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET,
        },
        auth: oauth2_1.default.GOOGLE_CONFIGURATION,
    },
    scope: ["profile", "email"],
    startRedirectPath: "/auth/google",
    callbackUri: `${process.env.BASE_URL}/auth/google/callback`,
};
exports.oauthFaceBookOption = {
    name: "facebookOAuth2",
    credentials: {
        client: {
            id: process.env.FACEBOOK_CLIENT_ID,
            secret: process.env.FACEBOOK_CLIENT_SECRET,
        },
        auth: oauth2_1.default.FACEBOOK_CONFIGURATION,
    },
    scope: ["profile", "email"],
    startRedirectPath: "/auth/facebook",
    callbackUri: `${process.env.BASE_URL}/auth/facebook/callback`,
};
// Password hashing utility
const hashPassword = async (password) => {
    return await bcrypt_1.default.hash(password, 10);
};
exports.hashPassword = hashPassword;
const verifyPassword = async (password, hash) => {
    return await bcrypt_1.default.compare(password, hash);
};
exports.verifyPassword = verifyPassword;
