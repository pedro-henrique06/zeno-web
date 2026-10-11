import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useLogin() {
  const { login: loginAuth } = useAuth();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (response) => {
      await loginAuth(
        response.token,
        {
          id: response.userId,
          name: response.name,
          email: response.email,
        },
        response.refreshToken,
      );
    },
  });
}

export function useRegister() {
  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
  });
}

export function useLogout() {
  const { logout: logoutAuth } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      void logoutAuth();
      queryClient.clear();
    },
    onError: () => {
      void logoutAuth();
      queryClient.clear();
    },
  });
}

/**
 * Wipes the account's financial data on the server. The user stays signed in and every screen refetches,
 * so they land on an empty account. A failure leaves both the data and the session untouched.
 */
export function useResetAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.resetAccount(),
    onSuccess: () => queryClient.invalidateQueries(),
  });
}
