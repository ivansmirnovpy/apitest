import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Env } from '../utils/env';

declare module 'fastify' {
  interface FastifyInstance {
    config: Env;
  }
}

type EnvPluginOptions = {
  env: Env;
};

const envPlugin: FastifyPluginAsync<EnvPluginOptions> = async (fastify, options) => {
  fastify.decorate('config', options.env);
};

export default fp(envPlugin, {
  name: 'env-plugin',
});
