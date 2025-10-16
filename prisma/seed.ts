import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clientId = 'acme-corp';
  const rawSecret = 'super-secret-value';
  const hashedSecret = crypto.createHash('sha256').update(rawSecret).digest('hex');

  const metadata = JSON.stringify({
    name: 'Acme Corp',
    contactEmail: 'admin@acme.example',
    plan: 'enterprise',
    features: ['webhooks', 'sso'],
  });

  await prisma.tenant.upsert({
    where: { clientId },
    update: {
      hashedClientSecret: hashedSecret,
      backendUrl: 'https://api.acme.example/v1',
      metadata,
    },
    create: {
      clientId,
      hashedClientSecret: hashedSecret,
      backendUrl: 'https://api.acme.example/v1',
      metadata,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Failed to seed database', error);
    await prisma.$disconnect();
    process.exit(1);
  });
