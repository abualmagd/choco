import { hashPassword } from "./../authentication/auth";
import { FastifyInstance, FastifyPluginAsync } from "fastify";
import { verifyPassword } from "../authentication/auth";
import { CustomResponse, ResError } from "../utils/responseClasses";
import { sendEamil } from "../services/emailServices";
import { randomInt } from "node:crypto";
import { isAuthenticate } from "../authentication/middleware";

export const authRouters: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opt: any
) => {
  fastify.post("/login", async (request, reply) => {
    const { email, password } = request.body as {
      email: string;
      password: string;
    };

    try {
      const user = await fastify.prisma.user.findUnique({
        where: {
          email: email,
        },
        include: {
          sessions: true,
        },
      });
      if (!user || !(await verifyPassword(password, user.password))) {
        return reply.status(401).send({
          error: "invalid",
          message: "Invalid Credintials",
          code: 401,
        });
      }

      // ✅ Create the session
      request.session.user = {
        id: user?.id!,
        username: user?.name ?? undefined,
        email: user?.email,
        role: user?.role ?? "CUSTOMER",
      };

      return reply.send({
        success: true,
        message: "Logged in successfully",
      });
    } catch (error) {
      return reply.send(error);
    }
  });

  //register then login
  fastify.post("/register", async (request, reply) => {
    try {
      const { email, password, name, phone } = request.body as {
        email: string;
        password: string;
        name: string;
        phone: string;
      };
      const user = await fastify.prisma.user.create({
        data: {
          email: email,
          password: await hashPassword(password),
          name: name,
          phone: phone,
        },
      });
      if (user) {
        // ✅ Create the session
        request.session.user = {
          id: user?.id!,
          username: user?.name ?? undefined,
          email: user?.email,
          role: user?.role ?? "CUSTOMER",
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
    } catch (error) {
      return reply.send(error);
    }
  });

  //log out user
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
    } catch (error) {
      return reply.send(error);
    }
  });

  //login social media
  fastify.post("login/:provider", async (request, reply) => {
    const provider = request.params;
    switch (provider) {
      case "google":
        fastify.googleOAuth2.generateAuthorizationUri(
          request,
          reply,
          (err, authorizationEndpoint) => {
            if (err) reply.send(err);
            return reply.redirect(authorizationEndpoint);
          }
        );
        break;

      case "facebook":
        fastify.facebookOAuth2.generateAuthorizationUri(
          request,
          reply,
          (err, authorizationEndpoint) => {
            if (err) reply.send(err);
            return reply.redirect(authorizationEndpoint);
          }
        );
        break;
      default:
        break;
    }
  });

  //social callback
  fastify.get<{ Params: { provider: string } }>(
    "/login/:provider/callback",
    async (request, reply) => {
      const { provider } = request.params;
      switch (provider) {
        case "google":
          const { token } =
            await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
              request
            );
          //const userInfo = await fastify.googleOAuth2.userinfo(token);
          const userInfo = await fetch(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            {
              headers: { Authorization: `Bearer ${token.access_token}` },
            }
          ).then((res) => res.json());

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
            id: user?.id,
            username: user?.name!,
            role: user.role,
          };
          return reply.redirect("/");

        case "facebook":
          const { token: tokenF } =
            await fastify.googleOAuth2.getAccessTokenFromAuthorizationCodeFlow(
              request
            );
          const userInfoF = await fetch(
            `https://graph.facebook.com/v12.0/me?fields=id,name,email,picture&access_token=${tokenF.access_token}`
          ).then((res) => res.json());

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
                avatar: userInfoF.picture?.data?.url || null,
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
              username: user.name!,
              role: user.role,
            };
          }

          return reply.redirect("/");

        default:
          return reply.redirect("/login");
          break;
      }
    }
  );

  //forget password
  fastify.post<{ Params: { email: string } }>(
    "/forget-password",
    async (request, reply) => {
      const email = request.body;
      if (!email) {
        const err: MyError = {
          code: 400,
          message: "email required",
          error: "missing email",
        };
        return reply.status(400).send(err);
      }
      const temporaryPassword = randomInt(100000, 10000000)
        .toString()
        .padStart(6, "0");
      const user = await fastify.prisma.user.update({
        where: { id: request.session.user?.id },
        data: {
          password: await hashPassword(temporaryPassword),
        },
      });
      if (!user) {
        return reply.send(
          new ResError(
            500,
            "failed password recovery",
            "failed in password refresh"
          )
        );
      }
      //send email to user by the temporary password
      await sendEamil(
        user.name!,
        user.email,
        `your temporary password is ${temporaryPassword}`
      );

      return reply.send(
        new CustomResponse(
          "if your email is registerd, you will get  a password recovery email",
          null
        )
      );
    }
  );

  //update password
  fastify.post<{ Body: { oldpassword: string; newpassword: string } }>(
    "/update-password",
    { preHandler: isAuthenticate },
    async (request, reply) => {
      const { oldpassword, newpassword } = request.body;

      const user = await fastify.prisma.user.update({
        where: { id: request.session.user?.id },
        data: {
          password: await hashPassword(newpassword),
        },
      });
      if (!user) {
        return reply.send(
          new ResError(
            500,
            "failed password renewing",
            "failed in password renewing"
          )
        );
      }
      //send email to user by the temporary password
      await sendEamil(user.name!, user.email, `your password was renewed`);
      return reply.send(
        new CustomResponse("your password was updated well", null)
      );
    }
  );

  fastify.get("/session", async (request, reply) => {
    const id = request.session.user?.id!;
    const sessions = await fastify.prisma.session.findMany({
      where: { userId: id },
    });
    return reply.send(sessions);
  });
};
