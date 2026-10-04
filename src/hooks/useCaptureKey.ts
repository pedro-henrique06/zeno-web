import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as captureApi from '@/api/capture';

export function useCaptureKeyStatus(enabled = true) {
  return useQuery({ queryKey: ['capture-key'], queryFn: captureApi.getCaptureKeyStatus, enabled });
}

export function useCreateCaptureKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureApi.createCaptureKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capture-key'] }),
  });
}

export function useRevokeCaptureKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureApi.revokeCaptureKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capture-key'] }),
  });
}
