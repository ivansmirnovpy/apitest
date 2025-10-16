import { buildApp } from '../app';
import { loadEnv } from '../utils/env';

describe('Authentication Flow', () => {
  const env = loadEnv();
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp(env);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 400 for missing credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {},
    });

    expect(response.statusCode).toBe(400);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Invalid login payload');
  });

  it('should return 401 for invalid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        client_id: 'non-existent',
        client_secret: 'wrong-secret',
      },
    });

    expect(response.statusCode).toBe(401);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Invalid credentials');
  });

  it('should successfully authenticate with valid credentials', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        client_id: 'acme-corp',
        client_secret: 'super-secret-value',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('access_token');
    expect(body).toHaveProperty('token_type', 'Bearer');
    expect(body).toHaveProperty('expires_in');
    expect(body).toHaveProperty('tenant');
    expect(body.tenant).toHaveProperty('client_id', 'acme-corp');
  });

  it('should return 403 for disabled tenant', async () => {
    await app.prisma.tenant.update({
      where: { clientId: 'acme-corp' },
      data: { isDisabled: true },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        client_id: 'acme-corp',
        client_secret: 'super-secret-value',
      },
    });

    expect(response.statusCode).toBe(403);
    const body = JSON.parse(response.body);
    expect(body.message).toBe('Tenant account is disabled');

    await app.prisma.tenant.update({
      where: { clientId: 'acme-corp' },
      data: { isDisabled: false },
    });
  });

  it('should reject requests to protected routes without token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/protected/me',
    });

    expect(response.statusCode).toBe(401);
  });

  it('should allow access to protected routes with valid token', async () => {
    const loginResponse = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        client_id: 'acme-corp',
        client_secret: 'super-secret-value',
      },
    });

    const { access_token } = JSON.parse(loginResponse.body);

    const response = await app.inject({
      method: 'GET',
      url: '/protected/me',
      headers: {
        authorization: `Bearer ${access_token}`,
      },
    });

    expect(response.statusCode).toBe(200);
    const body = JSON.parse(response.body);
    expect(body).toHaveProperty('message', 'You are authenticated');
    expect(body).toHaveProperty('tenant');
    expect(body.tenant).toHaveProperty('clientId', 'acme-corp');
  });
});
