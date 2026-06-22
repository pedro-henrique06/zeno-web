import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/api/user';
import type { UpdateProfileRequest, ChangePasswordRequest, UpdateDailyBudgetRequest, UpdateCurrencyRequest, UpdateLanguageRequest } from '@/types';

export function useProfile(enabled = true) {
  return useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile, enabled });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => userApi.updateProfile(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => userApi.changePassword(data),
  });
}

export function useUpdateDailyBudget() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateDailyBudgetRequest) => userApi.updateDailyBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
    },
  });
}

export function useUpdateCurrency() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCurrencyRequest) => userApi.updateCurrency(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['balances'] });
      queryClient.invalidateQueries({ queryKey: ['entries'] });
      queryClient.invalidateQueries({ queryKey: ['monthlyExpenseCategories'] });
      queryClient.invalidateQueries({ queryKey: ['balances-horizon'] });
      queryClient.invalidateQueries({ queryKey: ['economized-horizon'] });
      queryClient.invalidateQueries({ queryKey: ['performance-horizon'] });
      queryClient.invalidateQueries({ queryKey: ['cost-of-living-horizon'] });
      queryClient.invalidateQueries({ queryKey: ['daily-average-horizon'] });
    },
  });
}

export function useUpdateLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateLanguageRequest) => userApi.updateLanguage(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
  });
}
