import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as goalApi from '@/api/goal';
import type { SaveGoalRequest } from '@/types';

export function useGoal() {
  return useQuery({ queryKey: ['goal'], queryFn: goalApi.getGoal });
}

export function useSaveGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveGoalRequest) => goalApi.saveGoal(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goal'] }),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => goalApi.deleteGoal(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['goal'] }),
  });
}
