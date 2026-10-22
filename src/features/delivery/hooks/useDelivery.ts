import { useQuery } from '@tanstack/react-query';
import { deliveryApi } from '../api/deliveryApi';
import { BACKOFFICE_REFETCH_MS } from '../../../config/app.config';
import { ApiError } from '../../../services/http';

/** Delivery of one order — stays empty while none exists yet (404) rather than erroring the page. */
export function useOrderDelivery(orderId: string | undefined, enabled: boolean) {
  return useQuery({
    queryKey: ['deliveries', 'by-order', orderId],
    queryFn: () => deliveryApi.getByOrderId(orderId!),
    enabled: !!orderId && enabled,
    retry: (failureCount, error) =>
      error instanceof ApiError && (error.status === 404 || error.status === 403) ? false : failureCount < 2,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}
