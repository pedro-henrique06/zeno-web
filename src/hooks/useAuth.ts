import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as authApi from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { LoginRequest, RegisterRequest } from '@/types';

export function useLogin() {
  const { login: loginAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      loginAuth(response.token);
      navigate('/');
    },
  });
}

export function useRegister() {
  const { login: loginAuth } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: (response) => {
      loginAuth(response.token);
      navigate('/');
    },
  });
}

export function useLogout() {
  const { logout: logoutAuth } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      logoutAuth();
      queryClient.clear();
      navigate('/login');
    },
    onError: () => {
      logoutAuth();
      queryClient.clear();
      navigate('/login');
    },
  });
}
