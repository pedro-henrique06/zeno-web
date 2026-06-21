import apiClient, { unwrap } from './client';
import type { SummaryResponse } from '@/types';

export async function getSummary(month: number, year: number): Promise<SummaryResponse> {
  return unwrap(apiClient.get('/summary', { params: { month, year } }));
}
