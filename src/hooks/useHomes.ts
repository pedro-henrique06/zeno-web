import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as homeApi from '@/api/home';
import type {
  CreateHomeRequest,
  UpdateHomeRequest,
  CreateExpenseRequest,
} from '@/types';

export function useHomes() {
  return useQuery({
    queryKey: ['homes'],
    queryFn: homeApi.getHomes,
  });
}

export function useHome(id: string) {
  return useQuery({
    queryKey: ['home', id],
    queryFn: () => homeApi.getHome(id),
    enabled: !!id,
  });
}

export function useCreateHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHomeRequest) => homeApi.createHome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] });
    },
  });
}

export function useUpdateHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateHomeRequest) => homeApi.updateHome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] });
    },
  });
}

export function useDeleteHome() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => homeApi.deleteHome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homes'] });
    },
  });
}

export function useHomeMembers(homeId: string) {
  return useQuery({
    queryKey: ['home-members', homeId],
    queryFn: () => homeApi.getHomeMembers(homeId),
    enabled: !!homeId,
  });
}

export function useAddMember(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: string) => homeApi.addMember(homeId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-members', homeId] });
    },
  });
}

export function useRemoveMember(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: string) =>
      homeApi.removeMember(homeId, memberUserId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-members', homeId] });
    },
  });
}

export function useLinkWallet(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => homeApi.linkWallet(homeId, walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-wallets', homeId] });
    },
  });
}

export function useUnlinkWallet(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (walletId: string) => homeApi.unlinkWallet(homeId, walletId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-wallets', homeId] });
    },
  });
}

export function useHomeWallets(homeId: string) {
  return useQuery({
    queryKey: ['home-wallets', homeId],
    queryFn: () => homeApi.getHomeWallets(homeId),
    enabled: !!homeId,
  });
}

export function useExpenses(homeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['home-expenses', homeId, month, year],
    queryFn: () => homeApi.getExpenses(homeId, month, year),
    enabled: !!homeId,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateExpenseRequest) => homeApi.createExpense(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['home-expenses', variables.homeId],
      });
    },
  });
}

export function useDeleteExpense(homeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expenseId: string) => homeApi.deleteExpense(expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['home-expenses', homeId] });
    },
  });
}

export function useSplit(homeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['home-split', homeId, month, year],
    queryFn: () => homeApi.getSplit(homeId, month, year),
    enabled: !!homeId,
  });
}

export function useBudgetAlert(homeId: string, month: number, year: number) {
  return useQuery({
    queryKey: ['home-budget-alert', homeId, month, year],
    queryFn: () => homeApi.getBudgetAlert(homeId, month, year),
    enabled: !!homeId,
  });
}
