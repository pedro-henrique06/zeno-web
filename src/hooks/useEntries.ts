import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as entryApi from '@/api/entry';
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types';

export function useEntries(month: number, year: number, walletId: string) {
  return useQuery({
    queryKey: ['entries', walletId, month, year],
    queryFn: () => entryApi.getEntries(month, year, walletId),
    enabled: !!walletId,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEntryRequest) => entryApi.createEntry(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entries', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateEntryRequest) => entryApi.updateEntry(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entries', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
      queryClient.invalidateQueries({ queryKey: ['wallet', variables.walletId] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; walletId: string }) =>
      entryApi.deleteEntry(args.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['entries', variables.walletId] });
      queryClient.invalidateQueries({ queryKey: ['wallets'] });
    },
  });
}
