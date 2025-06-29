import { OAuth2Namespace } from "@fastify/oauth2";

declare module "fastify" {
  interface FastifyInstance {
    googleOAuth2: OAuth2Namespace;
    facebookOAuth2: OAuth2Namespace;
  }
}

import "@fastify/oauth2";

declare module "@fastify/oauth2" {
  interface Token {
    scope?: string;
    session_state?: string;
  }
}
