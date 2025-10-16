import { FastifyPluginAsync } from 'fastify';
import { loginRequestSchema, loginResponseSchema } from './schemas';
import { authenticateTenant } from './service';
import { createHttpError } from '../../errors/http-error';
import { TenantJwtPayload } from './types';

function getExpiresInSeconds(value: string): number {
  const numericValue = Number(value);
  if (!Number.isNaN(numericValue)) {
    return numericValue;
  }

  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw createHttpError(500, 'Invalid JWT_EXPIRES_IN configuration', 'ConfigurationError');
  }

  const amount = Number(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's':
      return amount;
    case 'm':
      return amount * 60;
    case 'h':
      return amount * 60 * 60;
    case 'd':
      return amount * 60 * 60 * 24;
    default:
      throw createHttpError(500, 'Invalid JWT_EXPIRES_IN configuration', 'ConfigurationError');
  }
}

const authRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.post('/login', async (request) => {
    const parseResult = loginRequestSchema.safeParse(request.body);

    if (!parseResult.success) {
      request.log.warn({ issues: parseResult.error.issues }, 'Invalid login payload');
      throw createHttpError(400, 'Invalid login payload');
    }

    const { client_id: clientId, client_secret: clientSecret } = parseResult.data;

    const tenant = await authenticateTenant(fastify.prisma, request.log, clientId, clientSecret);

    let metadata: Record<string, unknown> | null = null;
    try {
      metadata = JSON.parse(tenant.metadata);
    } catch (error) {
      request.log.warn({ tenantId: tenant.id, err: error }, 'Failed to parse tenant metadata');
    }

    const payload: TenantJwtPayload = {
      tenantId: tenant.id,
      clientId: tenant.clientId,
      backendUrl: tenant.backendUrl,
      metadata,
    };

    const token = await fastify.jwt.sign(payload);

    const expiresIn = getExpiresInSeconds(fastify.config.JWT_EXPIRES_IN);

    const response = {
      access_token: token,
      token_type: 'Bearer' as const,
      expires_in: expiresIn,
      tenant: {
        id: tenant.id,
        client_id: tenant.clientId,
        backend_url: tenant.backendUrl,
      },
    };

    return loginResponseSchema.parse(response);
  });
};

export default authRoutes;
