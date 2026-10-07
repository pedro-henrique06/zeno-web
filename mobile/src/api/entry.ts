import apiClient, { unwrap } from './client';
import type { Entry, CreateEntryRequest, UpdateEntryRequest, PagedResponse } from '@/types';

export async function getEntries(
  month: number,
  year: number,
  page = 1,
  pageSize = 50,
): Promise<PagedResponse<Entry>> {
  return unwrap(apiClient.get('/entry', { params: { month, year, page, pageSize } }));
}

export async function createEntry(data: CreateEntryRequest): Promise<Entry> {
  return unwrap(apiClient.post('/entry', data));
}

export async function updateEntry(data: UpdateEntryRequest): Promise<void> {
  await apiClient.put('/entry', data);
}

export async function deleteEntry(id: string): Promise<void> {
  await apiClient.delete(`/entry/${id}`);
}
