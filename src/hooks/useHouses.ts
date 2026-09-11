import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as houseApi from '@/api/house';
import type { CreateHouseRequest, UpdateHouseRequest } from '@/types';

export function useHouses() {
  return useQuery({ queryKey: ['houses'], queryFn: houseApi.getHouses });
}

export function useHouseEntries(houseId: string | null) {
  return useQuery({
    queryKey: ['house-entries', houseId],
    queryFn: () => houseApi.getHouseEntries(houseId!),
    enabled: !!houseId,
  });
}

export function useCreateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateHouseRequest) => houseApi.createHouse(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}

export function useUpdateHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateHouseRequest) => houseApi.updateHouse(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}

export function useDeleteHouse() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => houseApi.deleteHouse(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['houses'] }),
  });
}
