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

export function useCaptureCards(enabled = true) {
  return useQuery({ queryKey: ['capture-cards'], queryFn: captureApi.getCaptureCards, enabled });
}

/** Classifying a card can change the kind of past entries, so every money view refetches. */
export function useClassifyCaptureCard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: captureApi.classifyCaptureCard,
    onSuccess: () => {
      for (const key of ['capture-cards', 'entries', 'balances', 'balances-horizon', 'summary']) {
        queryClient.invalidateQueries({ queryKey: [key] });
      }
    },
  });
}
