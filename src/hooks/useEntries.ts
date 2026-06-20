import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as entryApi from '@/api/entry';
import { useWallets } from '@/hooks/useWallets';
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types';

export function useEntries(month: number, year: number, walletId: string) {
  return useQuery({
    queryKey: ['entries', walletId, month, year],
    queryFn: () => entryApi.getEntries(month, year, walletId),
    enabled: !!walletId,
  });
}

/**
 * Aggregates entries across every wallet for a given month, since the API
 * only supports fetching entries one wallet at a time.
 */
export function useAllEntries(month: number, year: number) {
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const walletIds = wallets?.map((w) => w.id) ?? [];

  const query = useQuery({
    queryKey: ['entries', 'all', walletIds.join(','), month, year],
    queryFn: async () => {
      const results = await Promise.all(
        walletIds.map((id) => entryApi.getEntries(month, year, id)),
      );
      return results.flat();
    },
    enabled: walletIds.length > 0,
  });

  return {
    ...query,
    isLoading: walletsLoading || query.isLoading,
    data: walletIds.length === 0 && !walletsLoading ? [] : query.data,
  };
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
