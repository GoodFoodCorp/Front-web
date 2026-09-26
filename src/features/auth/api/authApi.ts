import { http } from '../../../services/http';
import type { Profile } from '../../../types/common.types';
import type { LoginResponse, OAuthProvider } from '../types/auth.types';

/** The browser is redirected here; it is not an XHR call. */
export function oauthStartUrl(provider: string): string {
  return `/api/auth/oauth/${provider}`;
}

export const authApi = {
  login: (email: string, password: string) =>
    http<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /** Registers a client account (no tenant → "user" role). */
  register: (email: string, password: string) =>
    http<{ message: string; user_id: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  me: () => http<Profile>('/api/user/me'),

  /** Only the providers whose credentials are configured server-side, so the
   *  login page never shows a button that cannot work. */
  oauthProviders: () => http<OAuthProvider[]>('/api/auth/oauth/providers'),

  logout: (refreshToken: string) =>
    http('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    http<{ message: string }>('/api/user/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: newPassword,
      }),
    }),

  deleteAccount: (password: string) =>
    http<{ message: string }>('/api/user/me', {
      method: 'DELETE',
      body: JSON.stringify({ password }),
    }),
};
