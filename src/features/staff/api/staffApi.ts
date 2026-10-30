import { http } from '../../../services/http';
import type { StaffMember, StaffPage, StaffRole } from '../types/staff.types';

export const STAFF_PAGE_SIZE = 25;

/** Head office: accounts and their access, owned by auth-service. */
export const staffApi = {
  list: (page: number, search: string) =>
    http<StaffPage>(`/api/admin/users?page=${page}&limit=${STAFF_PAGE_SIZE}&q=${encodeURIComponent(search)}`),

  /** One role per account; a manager is attached to a restaurant. The
   *  account's sessions are closed so the change applies at once. */
  setAccess: (userId: string, role: StaffRole, restaurantId: string | null) =>
    http<StaffMember>(`/api/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role, restaurant_id: restaurantId ?? '' }),
    }),
};
