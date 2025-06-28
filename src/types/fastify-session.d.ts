import "@fastify/session";

declare module "@fastify/session" {
  interface Session {
    user?: {
      id: number;
      name?: string;
      email?: string;
      role?: string;
    };
  }
}
