import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as salaryApi from '@/api/salary';
import type { CreateSalaryRequest, UpdateSalaryRequest } from '@/types';

export function useSalaries(walletId: string) {
  return useQuery({
    queryKey: ['salaries', walletId],
    queryFn: () => salaryApi.getSalariesByWallet(walletId),
    enabled: !!walletId,
  });
}

export function useCreateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateSalaryRequest) => salaryApi.createSalary(data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaries', variables.walletId] });
    },
  });
}

export function useUpdateSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateSalaryRequest) => salaryApi.updateSalary(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salaries'] });
    },
  });
}

export function useDeleteSalary() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: { id: string; walletId: string }) =>
      salaryApi.deleteSalary(args.id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['salaries', variables.walletId] });
    },
  });
}
