import { useQuery, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import * as goalApi from '@/api/goal';
import type { SaveGoalRequest } from '@/types';
import { WIDGET_SUMMARY_KEY } from '@/widgets/queryKey';

function invalidateGoal(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: ['goal'] });
  queryClient.invalidateQueries({ queryKey: WIDGET_SUMMARY_KEY });
}

export function useGoal() {
  return useQuery({ queryKey: ['goal'], queryFn: goalApi.getGoal });
}

export function useSaveGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveGoalRequest) => goalApi.saveGoal(data),
    onSuccess: () => invalidateGoal(queryClient),
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => goalApi.deleteGoal(),
    onSuccess: () => invalidateGoal(queryClient),
  });
}
