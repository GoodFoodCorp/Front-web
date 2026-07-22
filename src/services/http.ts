import { useAuthStore } from '../store/authStore';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Single network entry point (spec: no fetch calls outside the API layer).
 * Same-origin URLs — the Vite dev proxy / nginx routes them per service,
 * exactly like the future K8s ingress.
 */
export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && useAuthStore.getState().accessToken) {
    useAuthStore.getState().logout();
  }
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new ApiError(res.status, body?.error ?? `Erreur ${res.status}`);
  }
  return (await res.json()) as T;
}
