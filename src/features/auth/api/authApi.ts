import { http } from '../../../services/http';
import type { Profile } from '../../../types/common.types';
import type { LoginResponse } from '../types/auth.types';

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

  logout: (refreshToken: string) =>
    http('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refresh_token: refreshToken }),
    }),
};
