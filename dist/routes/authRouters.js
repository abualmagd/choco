"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouters = void 0;
const auth_1 = require("./../authentication/auth");
const auth_2 = require("../authentication/auth");
const authRouters = async (fastify, opt) => {
    fastify.post("/login", async (request, reply) => {
        var _a, _b;
        const { email, password } = request.body;
        try {
            const user = await fastify.prisma.user.findUnique({
                where: {
                    email: email,
                },
                include: {
                    sessions: true,
                },
            });
            if (!user || !(await (0, auth_2.verifyPassword)(password, user.password))) {
                reply.status(401).send({
                    error: "invalid",
                    message: "Invalid Credintials",
                    code: 401,
                });
            }
            // ✅ Create the session
            request.session.user = {
                id: user === null || user === void 0 ? void 0 : user.id,
                username: (_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : undefined,
                email: user === null || user === void 0 ? void 0 : user.email,
                role: (_b = user === null || user === void 0 ? void 0 : user.role) !== null && _b !== void 0 ? _b : "user",
            };
            reply.send({ success: true, message: "Logged in successfully" });
        }
        catch (error) {
            reply.send(error);
        }
    });
    //register then login
    fastify.post("/register", async (request, reply) => {
        var _a, _b;
        try {
            const { email, password, name, phone } = request.body;
            const user = await fastify.prisma.user.create({
                data: {
                    email: email,
                    password: await (0, auth_1.hashPassword)(password),
                    name: name,
                    phone: phone,
                },
            });
            if (user) {
                // ✅ Create the session
                request.session.user = {
                    id: user === null || user === void 0 ? void 0 : user.id,
                    username: (_a = user === null || user === void 0 ? void 0 : user.name) !== null && _a !== void 0 ? _a : undefined,
                    email: user === null || user === void 0 ? void 0 : user.email,
                    role: (_b = user === null || user === void 0 ? void 0 : user.role) !== null && _b !== void 0 ? _b : "user",
                };
                reply.send({ success: true, message: "Registered in successfully" });
            }
            reply.status(500).send({
                error: "server error",
                message: "Registering failed",
                code: 500,
            });
        }
        catch (error) {
            reply.send(error);
        }
    });
    fastify.post("login/:provider", async (request, reply) => {
        const provider = request.params;
        switch (provider) {
            case "google":
                fastify.googleOAuth2.generateAuthorizationUri(request, reply, (err, authorizationEndpoint) => {
                    if (err)
                        reply.send(err);
                    reply.redirect(authorizationEndpoint);
                });
                break;
            case "facebook":
                fastify.facebookOAuth2.generateAuthorizationUri(request, reply, (err, authorizationEndpoint) => {
                    if (err)
                        reply.send(err);
                    reply.redirect(authorizationEndpoint);
                });
                break;
            default:
                break;
        }
    });
};
exports.authRouters = authRouters;
