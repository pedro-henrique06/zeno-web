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

export function useCaptureRules(enabled = true) {
  return useQuery({ queryKey: ['capture-rules'], queryFn: captureApi.getCaptureRules, enabled });
}

export function useAddCaptureRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureApi.addCaptureRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capture-rules'] }),
  });
}

export function useDeleteCaptureRule() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureApi.deleteCaptureRule,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['capture-rules'] }),
  });
}
