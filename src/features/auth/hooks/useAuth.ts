import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginResponse } from '../types/auth.types';
import { decodeJwt, useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';

type Credentials = { email: string; password: string };

export const COURIER_MOBILE_ONLY_MESSAGE =
  "Les livreurs se connectent uniquement depuis l'application mobile.";

/** Hydrates the session store from a login response's JWT. Courier accounts are
 *  refused: they sign in from the mobile app only. */
export function useHydrateSession() {
  const setSession = useAuthStore((s) => s.setSession);
  return (data: LoginResponse) => {
    const claims = decodeJwt(data.access_token);
    const roles = (claims.role_slugs as string[]) ?? [];
    if (roles.includes('livreur')) {
      void authApi.logout(data.refresh_token).catch(() => undefined);
      throw new Error(COURIER_MOBILE_ONLY_MESSAGE);
    }
    setSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      userId: (claims.sub as string) ?? null,
      email: (claims.email as string) ?? null,
      tenantId: (claims.tenant_id as string) || null,
      roles,
    });
  };
}

/** Providers enabled server-side. Fails soft: if auth-service can't answer,
 *  the login page simply shows no social buttons. */
export function useOAuthProviders() {
  return useQuery({
    queryKey: ['auth', 'oauth-providers'],
    queryFn: authApi.oauthProviders,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
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

/** Changing the password revokes every session server-side, so the local one
 *  is cleared too — the user must sign back in with the new password. */
export function useChangePassword() {
  const logout = useLogout();
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }) =>
      authApi.changePassword(currentPassword, newPassword),
    onSuccess: logout,
  });
}

export function useDeleteAccount() {
  const logout = useLogout();
  return useMutation({
    mutationFn: (password: string) => authApi.deleteAccount(password),
    onSuccess: logout,
  });
}
