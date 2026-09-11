import apiClient, { unwrap } from './client';
import type { House, CreateHouseRequest, UpdateHouseRequest } from '@/types';

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
