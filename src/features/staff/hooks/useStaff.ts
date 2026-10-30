import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../api/staffApi';
import type { StaffRole } from '../types/staff.types';

export function useStaff(page: number, search: string) {
  return useQuery({
    queryKey: ['staff', page, search],
    queryFn: () => staffApi.list(page, search),
    placeholderData: keepPreviousData,
  });
}

export function useSetStaffAccess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role, restaurantId }: { userId: string; role: StaffRole; restaurantId: string | null }) =>
      staffApi.setAccess(userId, role, restaurantId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['staff'] }),
  });
}
