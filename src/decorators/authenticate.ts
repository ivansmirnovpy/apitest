import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyReply } from 'fastify';
import { createHttpError } from '../errors/http-error';
import { TenantJwtPayload } from '../routes/auth/types';

declare module 'fastify' {
  interface FastifyRequest {
    tenant: TenantJwtPayload | null;
  }

  interface FastifyInstance {
    authenticate(request: FastifyRequest, reply: FastifyReply): Promise<void>;
  }
}

const authenticateDecorator: FastifyPluginAsync = async (fastify) => {
  fastify.decorateRequest('tenant', null);

  fastify.decorate('authenticate', async (request) => {
    try {
      const payload = await request.jwtVerify<TenantJwtPayload>();
      request.tenant = payload;
    } catch (error) {
      request.log.warn({ err: error }, 'JWT verification failed');
      throw createHttpError(401, 'Invalid or expired token');
    }
  });
};

export default fp(authenticateDecorator, {
  name: 'authenticate-decorator',
  dependencies: ['jwt-plugin'],
});
