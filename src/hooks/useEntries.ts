import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import * as entryApi from '@/api/entry';
import type { CreateEntryRequest, UpdateEntryRequest } from '@/types';

export function useEntries(month: number, year: number, page = 1, pageSize = 50) {
  return useQuery({
    queryKey: ['entries', month, year, page, pageSize],
    queryFn: () => entryApi.getEntries(month, year, page, pageSize),
  });
}

function invalidateAll(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['entries'] });
  queryClient.invalidateQueries({ queryKey: ['balances'] });
  queryClient.invalidateQueries({ queryKey: ['summary'] });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntryRequest) => entryApi.createEntry(data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateEntryRequest) => entryApi.updateEntry(data),
    onSuccess: () => invalidateAll(queryClient),
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => entryApi.deleteEntry(id),
    onSuccess: () => invalidateAll(queryClient),
  });
}
