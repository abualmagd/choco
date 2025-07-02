import { OAuth2Namespace } from "@fastify/oauth2";
import "@fastify/oauth2";
import { PrismaClient } from "@prisma/client";
declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
    facebookOAuth2: OAuth2Namespace;
    prisma: PrismaClient;
  }
}

declare module "@fastify/oauth2" {
  interface Token {
    scope?: string;
    session_state?: string;
  }
}
