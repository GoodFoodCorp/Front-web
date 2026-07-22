import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Session {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  tenantId: string | null;
  roles: string[];
}

interface AuthState extends Session {
  setSession: (s: Omit<Session, 'roles'> & { roles: string[] }) => void;
  logout: () => void;
  hasRole: (role: string) => boolean;
}

const EMPTY: Session = {
  accessToken: null,
  refreshToken: null,
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      ...EMPTY,
      setSession: (s) => set(s),
      logout: () => set(EMPTY),
      hasRole: (role) => get().roles.includes(role),
    }),
    { name: 'goodfood.session' },
  ),
);
