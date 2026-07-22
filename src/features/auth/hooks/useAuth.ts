import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginResponse } from '../types/auth.types';
import { decodeJwt, useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';

type Credentials = { email: string; password: string };

/** Hydrates the session store from a login response's JWT. */
function useHydrateSession() {
  const setSession = useAuthStore((s) => s.setSession);
  return (data: LoginResponse) => {
    const claims = decodeJwt(data.access_token);
    setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: (claims.sub as string) ?? null,
      email: (claims.email as string) ?? null,
      tenantId: (claims.tenant_id as string) || null,
      roles: (claims.role_slugs as string[]) ?? [],
    });
  };
}

/** Login mutation: authenticates then hydrates the session store from the JWT. */
export function useLogin() {
  const hydrate = useHydrateSession();
  return useMutation({
    mutationFn: ({ email, password }: Credentials) => authApi.login(email, password),
    onSuccess: hydrate,
  });
}

/** Register mutation: creates a client account, then logs in automatically. */
export function useRegister() {
  const hydrate = useHydrateSession();
  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      await authApi.register(email, password);
      return authApi.login(email, password);
    },
    onSuccess: hydrate,
  });
}

/** Clears the session server- and client-side. */
export function useLogout() {
  const { refreshToken, logout } = useAuthStore();
  const clearCart = useCartStore((s) => s.clear);

  return () => {
    if (refreshToken) {
      void authApi.logout(refreshToken).catch(() => undefined);
    }
    logout();
    clearCart();
  };
}
