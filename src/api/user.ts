import apiClient from './client';
import type { UserProfile, UpdateProfileRequest, ChangePasswordRequest, UpdateDailyBudgetRequest } from '@/types';

export async function getProfile(): Promise<UserProfile> {
  const response = await apiClient.get<UserProfile>('/user/me');
  return response.data;
}

export async function updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>('/user/me', data);
  return response.data;
}

export async function changePassword(data: ChangePasswordRequest): Promise<void> {
  await apiClient.put('/user/me/password', data);
}

export async function updateDailyBudget(data: UpdateDailyBudgetRequest): Promise<UserProfile> {
  const response = await apiClient.put<UserProfile>('/user/me/daily-budget', data);
  return response.data;
}
