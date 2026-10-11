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
/** authorizationCode lets the server revoke Sign in with Apple at Apple when the account is deleted. */
export async function loginWithApple(
  identityToken: string,
  fullName?: string,
  authorizationCode?: string | null,
): Promise<AuthResponse> {
  const response = await apiClient.post<AuthResponse>('/auth/apple', {
    identityToken,
    fullName,
    authorizationCode: authorizationCode ?? undefined,
  });
  return response.data;
}

/** Asks the server to email a 6-digit reset code (same answer whether or not the account exists). */
export async function forgotPassword(email: string): Promise<void> {
  await apiClient.post('/auth/forgot-password', { email });
}

export async function resetPassword(data: { email: string; code: string; newPassword: string; confirmNewPassword: string }): Promise<void> {
  await apiClient.post('/auth/reset-password', data);
}

export async function logout(): Promise<void> {
  await apiClient.post('/auth/logout');
}

export async function resetAccount(): Promise<void> {
  await apiClient.post('/auth/reset-account');
}
