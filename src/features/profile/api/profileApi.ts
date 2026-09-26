import { http } from '../../../services/http';
import type { Address, AddressForm, NotificationPreferences, ProfileForm, UserProfile } from '../types/profile.types';

export const profileApi = {
  me: () => http<UserProfile>('/api/users/me'),

  update: (form: ProfileForm) =>
    http<UserProfile>('/api/users/me', { method: 'PUT', body: JSON.stringify(form) }),

  uploadAvatar: (file: File) => {
    const body = new FormData();
    body.append('avatar', file);
    return http<UserProfile>('/api/users/me/avatar', { method: 'POST', body });
  },

  listAddresses: () => http<Address[]>('/api/users/me/addresses'),

  addAddress: (form: AddressForm) =>
    http<Address>('/api/users/me/addresses', { method: 'POST', body: JSON.stringify(form) }),

  deleteAddress: (id: string) =>
    http<void>(`/api/users/me/addresses/${id}`, { method: 'DELETE' }),

  getNotifications: () => http<NotificationPreferences>('/api/users/me/notifications'),

  updateNotifications: (prefs: NotificationPreferences) =>
    http<NotificationPreferences>('/api/users/me/notifications', { method: 'PUT', body: JSON.stringify(prefs) }),
};
