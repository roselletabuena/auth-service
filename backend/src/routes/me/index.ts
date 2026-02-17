import { FastifyPluginAsync } from "fastify";

const protectedRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get(
    "/",
    {
      preHandler: fastify.authenticate,
    },
    async function (request: any, reply) {
      return reply.send({
        message: "You are authenticated!",
        user: {
          sub: request.user.sub,
          email: request.user.email,
          username: request.user.username,
        },
      });
    },
  );
};

export default protectedRoutes;
