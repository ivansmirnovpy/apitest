import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const clientId = 'acme-corp';
  const rawSecret = 'super-secret-value';
  const hashedSecret = await bcrypt.hash(rawSecret, 10);

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
      isDisabled: false,
    },
    create: {
      clientId,
      hashedClientSecret: hashedSecret,
      backendUrl: 'https://api.acme.example/v1',
      metadata,
      isDisabled: false,
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
