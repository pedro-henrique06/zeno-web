import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as accountApi from '@/api/account';
import type { CreateAccountRequest, UpdateAccountRequest } from '@/types';

export function useAccounts() {
  return useQuery({
    queryKey: ['accounts'],
    queryFn: accountApi.getAccounts,
  });
}

export function useAccountsByWallet(walletId: string) {
  return useQuery({
    queryKey: ['accounts', 'wallet', walletId],
    queryFn: () => accountApi.getAccountsByWallet(walletId),
    enabled: !!walletId,
  });
}

export function useAccount(id: string) {
  return useQuery({
    queryKey: ['account', id],
    queryFn: () => accountApi.getAccountById(id),
    enabled: !!id,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateAccountRequest) => accountApi.createAccount(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      queryClient.invalidateQueries({ queryKey: ['accounts', 'wallet', variables.walletId] });
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateAccountRequest) => accountApi.updateAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}

export function useDeleteAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => accountApi.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
    },
  });
}