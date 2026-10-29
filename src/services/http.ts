import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/app.config';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/** Routes for which a 401 means "wrong credentials", not "session expired". */
const NO_REFRESH_PATHS = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/auth/logout'];

let refreshing: Promise<boolean> | null = null;

/**
 * Renews the access token with the HttpOnly refresh cookie. Concurrent
 * callers share one request: the refresh token rotates on use, so two
 * parallel refreshes would invalidate each other.
 */
export function refreshSession(): Promise<boolean> {
  refreshing ??= (async () => {
    try {
      const res = await fetch(new URL('/api/auth/refresh', API_BASE_URL), {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) return false;
      const body = (await res.json()) as { access_token?: string };
      if (!body.access_token) return false;
      useAuthStore.getState().setAccessToken(body.access_token);
      return true;
    } catch {
      return false;
    } finally {
      refreshing = null;
    }
  })();
  return refreshing;
}

function send(path: string, options: RequestInit): Promise<Response> {
  const token = useAuthStore.getState().accessToken;
  // FormData bodies (file uploads) need the browser's own multipart boundary
  // header, so the default JSON content-type is skipped for them.
  const isFormData = options.body instanceof FormData;
  return fetch(new URL(path, API_BASE_URL), {
    ...options,
    // The session cookies travel with every call (api.c-mbk.fr is same-site).
    credentials: 'include',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

/**
 * Single network entry point (spec: no fetch calls outside the API layer).
 * An expired access token is renewed once, transparently; if the session
 * cannot be renewed, the user is signed out.
 */
export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  let res = await send(path, options);

  const signedIn = useAuthStore.getState().userId !== null;
  if (res.status === 401 && signedIn && !NO_REFRESH_PATHS.includes(path)) {
    if (await refreshSession()) {
      res = await send(path, options);
    }
    if (res.status === 401) {
      useAuthStore.getState().logout();
    }
  }

  const text = await res.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!res.ok) {
    throw new ApiError(res.status, (body as { error?: string } | null)?.error ?? `Erreur ${res.status}`);
  }
  // 204 No Content (every DELETE in this app) has no body.
  if (res.status === 204) return undefined as T;
  return body as T;
}
