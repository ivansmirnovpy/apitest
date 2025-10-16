import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

const logLevelSchema = z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(3000),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: logLevelSchema.optional(),
});

type EnvSchema = z.infer<typeof envSchema>;

export type Env = Omit<EnvSchema, 'LOG_LEVEL'> & { LOG_LEVEL: z.infer<typeof logLevelSchema> };

let cachedEnv: Env | null = null;

export function loadEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }

  const nodeEnv = process.env.NODE_ENV ?? 'development';
  const envFileNames = ['.env', '.env.local', `.env.${nodeEnv}`, `.env.${nodeEnv}.local`];

  for (const fileName of envFileNames) {
    const filePath = path.resolve(process.cwd(), fileName);
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath, override: true });
    }
  }

  const parsedResult = envSchema.safeParse(process.env);

  if (!parsedResult.success) {
    console.error('❌ Invalid environment variables:');
    for (const issue of parsedResult.error.issues) {
      console.error(`  - ${issue.path.join('.') || 'unknown'}: ${issue.message}`);
    }
    process.exit(1);
  }

  const { LOG_LEVEL, ...rest } = parsedResult.data;
  const env: Env = {
    ...rest,
    LOG_LEVEL: LOG_LEVEL ?? (rest.NODE_ENV === 'development' ? 'debug' : 'info'),
  };

  cachedEnv = env;
  return env;
}
