import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { FastifyBaseLogger } from 'fastify';
import { createHttpError } from '../../errors/http-error';

export async function authenticateTenant(
  prisma: PrismaClient,
  logger: FastifyBaseLogger,
  clientId: string,
  clientSecret: string,
) {
  logger.info({ clientId }, 'Attempting to authenticate tenant');

  const tenant = await prisma.tenant.findUnique({
    where: { clientId },
  });

  if (!tenant) {
    logger.warn({ clientId }, 'Tenant not found');
    throw createHttpError(401, 'Invalid credentials');
  }

  if (tenant.isDisabled) {
    logger.warn({ clientId, tenantId: tenant.id }, 'Tenant is disabled');
    throw createHttpError(403, 'Tenant account is disabled');
  }

  const isValidSecret = await bcrypt.compare(clientSecret, tenant.hashedClientSecret);

  if (!isValidSecret) {
    logger.warn({ clientId, tenantId: tenant.id }, 'Invalid client secret');
    throw createHttpError(401, 'Invalid credentials');
  }

  logger.info({ clientId, tenantId: tenant.id }, 'Tenant authenticated successfully');

  return tenant;
}
