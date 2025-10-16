import Fastify, { FastifyError, FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import envPlugin from './plugins/env';
import { Env } from './utils/env';

export async function buildApp(env: Env): Promise<FastifyInstance> {
  const isDevelopment = env.NODE_ENV === 'development';

  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              translateTime: 'HH:MM:ss Z',
              ignore: 'pid,hostname',
            },
          }
        : undefined,
    },
  });

  await app.register(envPlugin, { env });

  app.addHook('onRequest', (request, _reply, done) => {
    request.log.info({ method: request.method, url: request.url }, 'Incoming request');
    done();
  });

  app.addHook('onResponse', (request, reply, done) => {
    request.log.info(
      { method: request.method, url: request.url, statusCode: reply.statusCode },
      'Request completed',
    );
    done();
  });

  app.setErrorHandler((error: FastifyError, request: FastifyRequest, reply: FastifyReply) => {
    const statusCode = error.statusCode || 500;

    app.log.error(
      {
        err: error,
        request: {
          method: request.method,
          url: request.url,
          params: request.params,
          query: request.query,
        },
      },
      'Request error',
    );

    if (statusCode === 500) {
      reply.status(500).send({
        error: 'Internal Server Error',
        message: isDevelopment ? error.message : 'An unexpected error occurred',
        statusCode: 500,
      });
    } else {
      reply.status(statusCode).send({
        error: error.name,
        message: error.message,
        statusCode,
      });
    }
  });

  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }));

  return app;
}
