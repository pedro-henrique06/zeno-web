import apiClient from './client';
import type { LoginRequest, RegisterRequest, AuthResponse } from '@/types';

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/login', data);
  return response.data;
}

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/register', data);
  return response.data;
}

/** Sign in with Apple: trades the identity token from the native Apple sheet for Zeno tokens. */
export async function loginWithApple(identityToken: string, fullName?: string): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/apple', { identityToken, fullName });
  return response.data;
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function resetAccount(): Promise<void> {
  await apiClient.post('/auth/reset-account');
}
