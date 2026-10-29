import { useMutation, useQuery } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import type { LoginResponse } from '../types/auth.types';
import { sessionFromToken, useAuthStore } from '../../../store/authStore';
import { useCartStore } from '../../../store/cartStore';

type Credentials = { email: string; password: string };

/** Hydrates the session store from a login response. Only the access token
 *  is kept, in memory: the refresh token stays in its HttpOnly cookie. */
export function useHydrateSession() {
  const setSession = useAuthStore((s) => s.setSession);
  return (data: Pick<LoginResponse, 'access_token'>) => setSession(sessionFromToken(data.access_token));
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
  const logout = useAuthStore((s) => s.logout);
  const clearCart = useCartStore((s) => s.clear);

  return () => {
    // The refresh cookie travels with the call: auth-service revokes it.
    void authApi.logout().catch(() => undefined);
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
