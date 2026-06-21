import apiClient, { unwrap } from './client';
import type { BalancesResponse } from '@/types';

export async function getBalances(month: number, year: number): Promise<BalancesResponse> {
  return unwrap(apiClient.get('/balances', { params: { month, year } }));
}
