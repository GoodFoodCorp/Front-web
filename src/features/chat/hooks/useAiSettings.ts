import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { aiSettingsApi } from '../api/aiSettingsApi';

const KEY = ['ai-settings'];

export function useAiSettings() {
  return useQuery({ queryKey: KEY, queryFn: aiSettingsApi.get });
}

export function useSaveAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: aiSettingsApi.save,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useResetAiSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: aiSettingsApi.reset,
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useTestAiSettings() {
  return useMutation({ mutationFn: aiSettingsApi.test });
}
