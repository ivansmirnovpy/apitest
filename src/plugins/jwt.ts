import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import { TenantJwtPayload } from '../routes/auth/types';

declare module '@fastify/jwt' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface FastifyJWT {
    payload: TenantJwtPayload;
  }
}

const jwtPlugin: FastifyPluginAsync = async (fastify) => {
  const { JWT_SECRET, JWT_EXPIRES_IN } = fastify.config;

  await fastify.register(fastifyJwt, {
    secret: JWT_SECRET,
    sign: {
      expiresIn: JWT_EXPIRES_IN,
    },
  });
};

export default fp(jwtPlugin, {
  name: 'jwt-plugin',
  dependencies: ['env-plugin'],
});
