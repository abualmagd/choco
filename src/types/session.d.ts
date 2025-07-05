import { Session } from "fastify";
// types/fastify-session.d.ts
import "@fastify/session";
import { FastifyReply } from "fastify";

declare module "@fastify/session" {
  interface FastifySessionObject {
    user?: {
      id: number;
      username?: string;
      email?: string;
      role?: string;
    };
  }
}

import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
  }
}

declare module "fastify" {
  interface FastifyReply {
    view(template: string, data?: Record<string, any>): void;
  }
}
