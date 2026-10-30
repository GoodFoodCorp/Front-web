import { http } from '../../../services/http';
import type { Payout, PayoutStatus } from '../types/payout.types';

/** Courier withdrawals, owned by delivery-service. */
export const payoutsApi = {
  list: (status: PayoutStatus) => http<Payout[]>(`/api/courier-profile/admin/withdrawals?status=${status}`),

  /** Records that the bank transfer was made. */
  markPaid: (id: string) => http<Payout>(`/api/courier-profile/admin/withdrawals/${id}/paid`, { method: 'PATCH' }),
};
