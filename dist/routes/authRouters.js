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
                return reply.status(401).send({
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
            return reply.send({ success: true, message: "Logged in successfully" });
        }
        catch (error) {
            return reply.send(error);
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
                await request.session.save();
                return reply.send({
                    success: true,
                    message: "Registered in successfully",
                });
            }
            return reply.status(500).send({
                error: "server error",
                message: "Registering failed",
                code: 500,
            });
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.post("/logout", async (request, reply) => {
        try {
            if (request.session.sessionId) {
                await fastify.prisma.session.delete({
                    where: {
                        id: request.session.sessionId,
                    },
                });
            }
            reply.clearCookie("sessionId", {
                path: "/",
                secure: process.env.NODE_ENV === "production",
                httpOnly: true,
                sameSite: "lax",
                // Must match original cookie settings:
                domain: process.env.COOKIE_DOMAIN || undefined,
                maxAge: 0, // Expire immediately
            });
            request.session.destroy((err) => {
                if (err) {
                    request.log.error("Session destruction error:", err);
                }
            });
            return reply.send({
                success: true,
                message: "Loged out successfully",
            });
        }
        catch (error) {
            return reply.send(error);
        }
    });
    fastify.post("login/:provider", async (request, reply) => {
        const provider = request.params;
        switch (provider) {
            case "google":
                fastify.googleOAuth2.generateAuthorizationUri(request, reply, (err, authorizationEndpoint) => {
                    if (err)
                        reply.send(err);
                    return reply.redirect(authorizationEndpoint);
                });
                break;
            case "facebook":
                fastify.facebookOAuth2.generateAuthorizationUri(request, reply, (err, authorizationEndpoint) => {
                    if (err)
                        reply.send(err);
                    return reply.redirect(authorizationEndpoint);
                });
                break;
            default:
                break;
        }
    });
    fastify.get("/login/:provider/callback", async (request, reply) => {
        var _a, _b;
        const { provider } = request.params;
        switch (provider) {
            case "google":
                const { token } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
                //const userInfo = await fastify.googleOAuth2.userinfo(token);
                const userInfo = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
                    headers: { Authorization: `Bearer ${token.access_token}` },
                }).then((res) => res.json());
                const user = await fastify.prisma.user.create({
                    data: {
                        email: userInfo.email,
                        name: userInfo.name,
                        avatar: userInfo.picture,
                        password: "",
                        accounts: {
                            create: [
                                {
                                    access_token: token.access_token,
                                    type: "oauth",
                                    provider: provider,
                                    providerAccountId: userInfo.id,
                                    refresh_token: token.refresh_token,
                                    expires_at: token.expires_in,
                                    token_type: token.token_type,
                                    scope: token.scope || "openid email profile",
                                    id_token: token.id_token,
                                    session_state: token.session_state,
                                },
                            ],
                        },
                    },
                });
                request.session.user = {
                    id: user === null || user === void 0 ? void 0 : user.id,
                    username: user === null || user === void 0 ? void 0 : user.name,
                    role: user.role,
                };
                return reply.redirect("/");
            case "facebook":
                const { token: tokenF } = await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(request);
                const userInfoF = await fetch(`https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${tokenF.access_token}`).then((res) => res.json());
                // Find or create user
                let userF = await fastify.prisma.user.findUnique({
                    where: { email: userInfo.email },
                    include: { accounts: true },
                });
                if (!userF) {
                    const user = await fastify.prisma.user.create({
                        data: {
                            email: userInfoF.email,
                            name: userInfoF.name,
                            avatar: ((_b = (_a = userInfoF.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url) || null,
                            password: "", // Empty password for OAuth users
                            accounts: {
                                create: {
                                    access_token: JSON.stringify(tokenF),
                                    refresh_token: tokenF.refresh_token || null,
                                    expires_at: tokenF.expires_in
                                        ? Math.floor(Date.now() / 1000) + tokenF.expires_in
                                        : null,
                                    token_type: tokenF.token_type,
                                    scope: undefined,
                                    type: "oauth",
                                    provider: provider,
                                    providerAccountId: userInfoF.id,
                                    id_token: tokenF.id_token,
                                    session_state: tokenF.session_state,
                                },
                            },
                        },
                    });
                    request.session.user = {
                        id: user.id,
                        username: user.name,
                        role: user.role,
                    };
                }
                return reply.redirect("/");
            default:
                return reply.redirect("/login");
                break;
        }
    });
};
exports.authRouters = authRouters;
