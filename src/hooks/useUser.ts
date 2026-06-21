import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '@/api/user';
import type { UpdateProfileRequest, ChangePasswordRequest, UpdateDailyBudgetRequest } from '@/types';

export function useProfile() {
  return useQuery({ queryKey: ['profile'], queryFn: userApi.getProfile });
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
