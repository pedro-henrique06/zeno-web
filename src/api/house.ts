import apiClient, { unwrap } from './client';
import type { House, CreateHouseRequest, UpdateHouseRequest, Entry } from '@/types';

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
