import apiClient, { unwrap } from './client';
import type { Tag, CreateTagRequest, UpdateTagRequest } from '@/types';

export async function getTags(): Promise<Tag[]> {
  return unwrap(apiClient.get('/tags'));
}

export async function createTag(data: CreateTagRequest): Promise<Tag> {
  return unwrap(apiClient.post('/tags', data));
}

export async function updateTag(data: UpdateTagRequest): Promise<void> {
  await apiClient.put('/tags', data);
}

export async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/tags/${id}`);
}
