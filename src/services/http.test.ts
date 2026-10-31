// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { http } from './http';
import { useAuthStore } from '../store/authStore';

/** A signed but fake access token carrying the given subject. */
function token(sub: string): string {
  const b64 = (o: object) => btoa(JSON.stringify(o)).replace(/=+$/, '');
  return `${b64({ alg: 'HS256' })}.${b64({ sub, role_slugs: ['user'], email: `${sub}@t.fr` })}.sig`;
}

function json(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('http', () => {
  beforeEach(() => {
    useAuthStore.getState().setAccessToken(token('u1'));
  });
  afterEach(() => {
    vi.restoreAllMocks();
    useAuthStore.getState().logout();
  });

  it('sends the access token and the session cookies', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json(200, { ok: true }));

    await http('/api/orders');

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.credentials).toBe('include');
    expect((init.headers as Record<string, string>).Authorization).toBe(`Bearer ${token('u1')}`);
  });

  it('renews an expired access token once and replays the call', async () => {
    const fresh = token('u1-renewed');
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(401))
      .mockResolvedValueOnce(json(200, { access_token: fresh }))
      .mockResolvedValueOnce(json(200, { id: 'o1' }));

    await expect(http('/api/orders/o1')).resolves.toEqual({ id: 'o1' });

    expect(String(fetchMock.mock.calls[1][0])).toContain('/api/auth/refresh');
    const replay = fetchMock.mock.calls[2][1] as RequestInit;
    expect((replay.headers as Record<string, string>).Authorization).toBe(`Bearer ${fresh}`);
    expect(useAuthStore.getState().accessToken).toBe(fresh);
  });

  it('shares one refresh between concurrent calls (the refresh token rotates)', async () => {
    let refreshes = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
      const url = String(input);
      if (url.includes('/api/auth/refresh')) {
        refreshes++;
        return json(200, { access_token: token('u1-new') });
      }
      const auth = (init?.headers as Record<string, string>)?.Authorization ?? '';
      return auth.includes(token('u1-new').split('.')[1]) ? json(200, {}) : json(401);
    });

    await Promise.all([http('/api/a'), http('/api/b'), http('/api/c')]);

    expect(refreshes).toBe(1);
  });

  it('signs out when the session cannot be renewed', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(json(401)).mockResolvedValueOnce(json(401));

    await expect(http('/api/orders')).rejects.toMatchObject({ status: 401 });
    expect(useAuthStore.getState().userId).toBeNull();
  });

  it('never tries to refresh on a failed login', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(json(401, { error: 'identifiants incorrects' }));

    await expect(http('/api/auth/login', { method: 'POST' })).rejects.toThrow('identifiants incorrects');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not persist any token', () => {
    const stored = localStorage.getItem('goodfood.session') ?? '';
    expect(stored).toContain('u1');
    expect(stored).not.toContain('accessToken');
  });

  it('reads the error message whatever the service stack', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json(400, { error: 'IBAN invalide' }))
      .mockResolvedValueOnce(json(403, { detail: 'admin only' }))
      .mockResolvedValueOnce(json(400, { title: 'One or more validation errors occurred.' }));

    await expect(http('/api/a')).rejects.toMatchObject({ status: 400, message: 'IBAN invalide' });
    await expect(http('/api/b')).rejects.toMatchObject({ status: 403, message: "Vous n'avez pas accès à cette action." });
    await expect(http('/api/c')).rejects.toMatchObject({ message: expect.stringContaining('Vérifiez votre saisie') });
  });

  it('survives a non-JSON error page from the gateway', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response('<html>502 Bad Gateway</html>', { status: 502 }))
      .mockResolvedValueOnce(new Response('Limit exceeded', { status: 429 }));

    await expect(http('/api/orders')).rejects.toMatchObject({ status: 502, message: expect.stringContaining('indisponible') });
    await expect(http('/api/auth/login')).rejects.toMatchObject({ status: 429, message: expect.stringContaining('Trop de tentatives') });
  });
});
