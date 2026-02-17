import {
  AuthFlowType,
  InitiateAuthCommand,
  SignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { FastifyPluginAsync } from "fastify";

const authRoutes: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{
    Body: { email: string; password: string };
  }>(
    "/register",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 8 },
          },
        },
      },
    },
    async function (request, reply) {
      const { email, password } = request.body;

      try {
        const command = new SignUpCommand({
          ClientId: fastify.config.AWS_COGNITO_CLIENT_ID,
          Username: email,
          Password: password,
          UserAttributes: [{ Name: "email", Value: email }],
        });

        const result = await fastify.cognito.send(command);

        return reply.status(201).send({
          message: "User registered. Check your email to confirm your account.",
          userSub: result.UserSub,
          confirmed: result.UserConfirmed,
        });
      } catch (err: any) {
        return reply.status(400).send({ error: err.message });
      }
    },
  );

  fastify.post<{ Body: { email: string; password: string } }>(
    "/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
        },
      },
    },
    async (request, reply) => {
      const { email, password } = request.body;

      try {
        const command = new InitiateAuthCommand({
          AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
          ClientId: fastify.config.AWS_COGNITO_CLIENT_ID,
          AuthParameters: {
            USERNAME: email,
            PASSWORD: password,
          },
        });

        const result = await fastify.cognito.send(command);
        const tokens = result.AuthenticationResult;

        return reply.send({
          accessToken: tokens?.AccessToken,
          idToken: tokens?.IdToken,
          refreshToken: tokens?.RefreshToken,
          expiresIn: tokens?.ExpiresIn,
        });
      } catch (err: any) {
        return reply.status(401).send({ error: err.message });
      }
    },
  );
};

export default authRoutes;
