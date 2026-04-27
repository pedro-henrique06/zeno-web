import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletApi from '@/api/wallet';
import type { CreateWalletRequest, UpdateWalletRequest } from '@/types';

export function useWallets() {
  return useQuery({
    queryKey: ['wallets'],
    queryFn: walletApi.getWallets,
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: ['wallet', id],
    queryFn: () => walletApi.getWallet(id),
    enabled: !!id,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWalletRequest) => walletApi.createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWalletRequest) => walletApi.updateWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => walletApi.deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
