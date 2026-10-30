import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { payoutsApi } from '../api/payoutsApi';
import type { PayoutStatus } from '../types/payout.types';

export function usePayouts(status: PayoutStatus) {
  return useQuery({ queryKey: ['payouts', status], queryFn: () => payoutsApi.list(status) });
}

export function useMarkPayoutPaid() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: payoutsApi.markPaid,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['payouts'] }),
  });
}
