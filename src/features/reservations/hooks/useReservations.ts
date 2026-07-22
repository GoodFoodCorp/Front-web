import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { reservationsApi } from '../api/reservationsApi';
import type { ReservationForm, ReservationStatus } from '../types/reservation.types';

export function useMyReservations() {
  return useQuery({ queryKey: ['reservations', 'mine'], queryFn: reservationsApi.listMine });
}

export function useRestaurantReservations() {
  return useQuery({
    queryKey: ['reservations', 'restaurant'],
    queryFn: reservationsApi.listForMyRestaurant,
  });
}

export function useCreateReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: ReservationForm) => reservationsApi.create(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useUpdateReservationStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReservationStatus }) =>
      reservationsApi.updateStatus(id, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}

export function useCancelMyReservation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => reservationsApi.cancelMine(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['reservations'] }),
  });
}
