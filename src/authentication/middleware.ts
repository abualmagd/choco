import { preHandlerAsyncHookHandler } from "fastify";

export const isAuthenticate: preHandlerAsyncHookHandler = async (
  request,
  reply
) => {
  if (!request.session.user) {
    return reply.status(401).send({
      code: 401,
      error: "not authenticated",
      message: "Unauthorized: No active session",
    });
  }
};

export const isAdminAuth: preHandlerAsyncHookHandler = async (
  request,
  reply
) => {
  if (!request.session.user) {
    return reply.status(401).send({
      code: 401,
      error: "not authenticated",
      message: "Unauthorized: No active session",
    });
  }

  if (request.session.user.role !== "ADMIN") {
    return reply.status(403).send({
      code: 403,
      error: "Forbidden",
      message: "Forbidden: Admin access required",
    });
  }
};

export const isModeratorAuth: preHandlerAsyncHookHandler = async (
  request,
  reply
) => {
  if (!request.session.user) {
    return reply.status(401).send({
      code: 401,
      error: "not authenticated",
      message: "Unauthorized: No active session",
    });
  }

  if (
    request.session.user.role !== "ADMIN" &&
    request.session.user.role !== "MODERATOR"
  ) {
    return reply.status(403).send({
      code: 403,
      error: "Forbidden",
      message: "Forbidden: Admin/moderator access required",
    });
  }
};
