export type TenantJwtPayload = {
  tenantId: string;
  clientId: string;
  backendUrl: string;
  metadata: Record<string, unknown> | null;
};
