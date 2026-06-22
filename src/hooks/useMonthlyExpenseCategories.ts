import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as monthlyExpenseCategoryApi from '@/api/monthlyExpenseCategory';
import type { CreateMonthlyExpenseCategoryRequest, UpdateMonthlyExpenseCategoryRequest } from '@/types';

export function useMonthlyExpenseCategories() {
  return useQuery({
    queryKey: ['monthlyExpenseCategories'],
    queryFn: monthlyExpenseCategoryApi.getMonthlyExpenseCategories,
  });
}

export function useCreateMonthlyExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMonthlyExpenseCategoryRequest) =>
      monthlyExpenseCategoryApi.createMonthlyExpenseCategory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyExpenseCategories'] }),
  });
}

export function useUpdateMonthlyExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMonthlyExpenseCategoryRequest) =>
      monthlyExpenseCategoryApi.updateMonthlyExpenseCategory(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyExpenseCategories'] }),
  });
}

export function useDeleteMonthlyExpenseCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => monthlyExpenseCategoryApi.deleteMonthlyExpenseCategory(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['monthlyExpenseCategories'] }),
  });
}
