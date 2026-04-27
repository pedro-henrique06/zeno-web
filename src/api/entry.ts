import apiClient from './client';
import type {
  Entry,
  CreateEntryRequest,
  UpdateEntryRequest,
} from '@/types';

export async function getEntries(
  month: number,
  year: number,
  walletId: string,
): Promise<Entry[]> {
  const response = await apiClient.get<Entry[]>('/entry', {
    params: { month, year, walletId },
  });
  return response.data;
}

export async function createEntry(data: CreateEntryRequest): Promise<void> {
  await apiClient.post('/entry', data);
}

export async function updateEntry(data: UpdateEntryRequest): Promise<void> {
  await apiClient.put('/entry', data);
}

export async function deleteEntry(id: string): Promise<void> {
  await apiClient.delete(`/entry/${id}`);
}
