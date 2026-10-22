import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deliveryApi } from '../api/deliveryApi';
import { BACKOFFICE_REFETCH_MS } from '../../../config/app.config';
import { ApiError } from '../../../services/http';

function invalidateDeliveries(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: ['deliveries'] });
  void qc.invalidateQueries({ queryKey: ['orders'] });
}

export function useAvailableDeliveries() {
  return useQuery({
    queryKey: ['deliveries', 'available'],
    queryFn: deliveryApi.listAvailable,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}

export function useMyDeliveries() {
  return useQuery({
    queryKey: ['deliveries', 'mine'],
    queryFn: deliveryApi.listMine,
    refetchInterval: BACKOFFICE_REFETCH_MS,
  });
}

export function useAcceptDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.accept(id),
    onSuccess: () => invalidateDeliveries(qc),
  });
}

export function usePickupDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.pickup(id),
    onSuccess: () => invalidateDeliveries(qc),
  });
}

export function useDropoffDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.dropoff(id),
    onSuccess: () => invalidateDeliveries(qc),
  });
}

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
