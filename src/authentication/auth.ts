import fastifyOauth2, { FastifyOAuth2Options } from "@fastify/oauth2";
import { FastifySessionOptions } from "@fastify/session";
import { PrismaClient } from "@prisma/client";
import { Session } from "fastify";
import bcrypt from "bcrypt";

interface UserSessionData {
  user?: {
    id: number;
    username?: string;
    email?: string;
    role?: string;
  };
}

const prisma = new PrismaClient();

type AppSession = Session & UserSessionData;
export const sessionOption: FastifySessionOptions = {
  secret:
    process.env.SESSION_SECRET || "hsgshgsbcbhcsbshbvshxkanxknzkjsbxhgbghvcxs",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    maxAge: 86400000, // 1 day
  },
  cookieName: "sessionId",

  store: {
    async set(sessionId, session: AppSession, callback) {
      try {
        await prisma.session.upsert({
          where: { id: sessionId },
          update: {
            data: JSON.stringify(session),
            expiresAt: new Date(Date.now() + 86400000),
            userId: session.user?.id,
          },
          create: {
            id: sessionId,
            data: JSON.stringify(session),
            expiresAt: new Date(Date.now() + 86400000),
            userId: session.user?.id!,
          },
        });
        callback();
      } catch (error) {
        callback(error);
      }
    },
    async get(sessionId, callback) {
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
          ...JSON.parse(session?.data!),
          cookie: {
            originalMaxAge: 86400000,
            expires: session?.expiresAt,
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
      } catch (error) {
        callback(error);
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
      } catch (error) {
        callback(error);
      }
    },
  },
};

export const oauthGoogleOption: FastifyOAuth2Options = {
  name: "googleOAuth2",
  credentials: {
    client: {
      id: process.env.GOOGLE_CLIENT_ID!,
      secret: process.env.GOOGLE_CLIENT_SECRET!,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  scope: ["profile", "email"],
  startRedirectPath: "/auth/google",
  callbackUri: `${process.env.BASE_URL}/auth/google/callback`,
};

export const oauthFaceBookOption: FastifyOAuth2Options = {
  name: "facebookOAuth2",
  credentials: {
    client: {
      id: process.env.FACEBOOK_CLIENT_ID!,
      secret: process.env.FACEBOOK_CLIENT_SECRET!,
    },
    auth: fastifyOauth2.FACEBOOK_CONFIGURATION,
  },
  scope: ["profile", "email"],
  startRedirectPath: "/auth/facebook",
  callbackUri: `${process.env.BASE_URL}/auth/facebook/callback`,
};

// Password hashing utility
export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifyPassword = async (password: string, hash: any) => {
  return await bcrypt.compare(password, hash);
};
