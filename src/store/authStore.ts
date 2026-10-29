import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * The signed-in user. Tokens never reach storage: the refresh token lives in
 * an HttpOnly cookie set by auth-service, and the short-lived access token is
 * kept in memory only (renewed silently, see services/http.ts). An XSS can
 * therefore not read a session out of localStorage.
 */
export interface Session {
  /** In memory only — never persisted. */
  accessToken: string | null;
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  roles: string[];
}

interface AuthState extends Session {
  setSession: (s: Session) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const EMPTY: Session = {
  accessToken: null,
  userId: null,
  email: null,
  tenantId: null,
  roles: [],
};

/** Decodes the JWT payload without verifying (verification is server-side). */
export function decodeJwt(token: string): Record<string, unknown> {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
  } catch {
    return {};
  }
}

/** The session described by an access token. */
export function sessionFromToken(accessToken: string): Session {
  const claims = decodeJwt(accessToken);
  return {
    accessToken,
    userId: (claims.sub as string) ?? null,
    email: (claims.email as string) ?? null,
    tenantId: (claims.tenant_id as string) || null,
    roles: (claims.role_slugs as string[]) ?? [],
  };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      setSession: (s) => set(s),
      setAccessToken: (token) => set(sessionFromToken(token)),
      logout: () => set(EMPTY),
      hasRole: (role) => get().roles.includes(role),
    }),
    {
      name: 'goodfood.session',
      // Identity only: who is signed in, for the UI. No credential is stored.
      partialize: ({ userId, email, tenantId, roles }) => ({ userId, email, tenantId, roles }),
    },
  ),
);

/** Whether a user is signed in (the access token may be renewed on demand). */
export const selectIsLoggedIn = (s: Session) => s.userId !== null;
