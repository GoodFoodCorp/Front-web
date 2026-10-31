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
    mutationFn: ({ id, code }: { id: string; code: string }) => deliveryApi.dropoff(id, code),
    onSuccess: () => invalidateDeliveries(qc),
  });
}

export function useReleaseDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deliveryApi.release(id),
    onSuccess: () => invalidateDeliveries(qc),
  });
}

export function useRateDelivery() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, rating, comment }: { id: string; rating: number; comment: string }) =>
      deliveryApi.rate(id, rating, comment),
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

export function useCourierOverview() {
  return useQuery({ queryKey: ['deliveries', 'overview'], queryFn: deliveryApi.overview });
}

/** null: the courier has no profile yet (404). */
export function useCourierProfile() {
  return useQuery({
    queryKey: ['courier-profile'],
    queryFn: async () => {
      try {
        return await deliveryApi.profile();
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
  });
}

export function useSaveCourierProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.saveProfile,
    onSuccess: (profile) => qc.setQueryData(['courier-profile'], profile),
  });
}

export function useSetAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.setAvailability,
    onSuccess: (profile) => qc.setQueryData(['courier-profile'], profile),
  });
}

export function useRequestPayout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deliveryApi.requestPayout,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['deliveries', 'overview'] }),
  });
}
