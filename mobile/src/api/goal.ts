import apiClient, { unwrap } from './client';
import type { Goal, SaveGoalRequest } from '@/types';

/** Resolves to null when the user has not saved a goal yet. */
export async function getGoal(): Promise<Goal | null> {
  return unwrap<Goal | null>(apiClient.get('/goals/me'));
}

export async function saveGoal(data: SaveGoalRequest): Promise<Goal> {
  return unwrap(apiClient.put('/goals/me', data));
}

export async function deleteGoal(): Promise<void> {
  await apiClient.delete('/goals/me');
}
