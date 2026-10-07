import apiClient, { unwrap } from './client';
import type {
  House,
  CreateHouseRequest,
  UpdateHouseRequest,
  Entry,
  HouseBudget,
  HouseGoal,
  SaveHouseGoalRequest,
} from '@/types';

export async function getHouses(): Promise<House[]> {
  return unwrap(apiClient.get('/houses'));
}

export async function createHouse(data: CreateHouseRequest): Promise<House> {
  return unwrap(apiClient.post('/houses', data));
}

export async function updateHouse(data: UpdateHouseRequest): Promise<void> {
  await apiClient.put('/houses', data);
}

export async function deleteHouse(id: string): Promise<void> {
  await apiClient.delete(`/houses/${id}`);
}

export async function getHouseEntries(houseId: string): Promise<Entry[]> {
  return unwrap(apiClient.get(`/houses/${houseId}/entries`));
}

export async function addHouseMember(houseId: string, email: string): Promise<void> {
  await apiClient.post(`/houses/${houseId}/members`, { email });
}

export async function removeHouseMember(houseId: string, memberId: string): Promise<void> {
  await apiClient.delete(`/houses/${houseId}/members/${memberId}`);
}

export async function getHouseBudget(houseId: string, month: number, year: number): Promise<HouseBudget> {
  return unwrap(apiClient.get(`/houses/${houseId}/budget`, { params: { month, year } }));
}

export async function saveHouseGoal(houseId: string, data: SaveHouseGoalRequest): Promise<HouseGoal | null> {
  return unwrap(apiClient.put(`/houses/${houseId}/goal`, data));
}

export async function deleteHouseGoal(houseId: string): Promise<void> {
  await apiClient.delete(`/houses/${houseId}/goal`);
}
