import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { profileApi } from '../api/profileApi';
import type { AddressForm, ProfileForm } from '../types/profile.types';

export function useMyProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: profileApi.me });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: ProfileForm) => profileApi.update(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useMyAddresses() {
  return useQuery({ queryKey: ['addresses'], queryFn: profileApi.listAddresses });
}

export function useAddAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: AddressForm) => profileApi.addAddress(form),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => profileApi.deleteAddress(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['addresses'] }),
  });
}
