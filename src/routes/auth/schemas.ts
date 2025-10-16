import { z } from 'zod';

export const loginRequestSchema = z.object({
  client_id: z.string().min(1, 'client_id is required'),
  client_secret: z.string().min(1, 'client_secret is required'),
});

export const loginResponseSchema = z.object({
  access_token: z.string(),
  token_type: z.literal('Bearer'),
  expires_in: z.number().positive(),
  tenant: z.object({
    id: z.string(),
    client_id: z.string(),
    backend_url: z.string(),
  }),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
