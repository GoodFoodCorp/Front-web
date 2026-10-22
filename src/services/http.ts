import { useAuthStore } from '../store/authStore';
import { API_BASE_URL } from '../config/app.config';

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

/**
 * Single network entry point (spec: no fetch calls outside the API layer).
 */
export async function http<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  // FormData bodies (file uploads) need the browser's own multipart boundary
  // header, so the default JSON content-type is skipped for them.
  const isFormData = options.body instanceof FormData;
  const res = await fetch(new URL(path, API_BASE_URL), {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (res.status === 401 && useAuthStore.getState().accessToken) {
    useAuthStore.getState().logout();
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
