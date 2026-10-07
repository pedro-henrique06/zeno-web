import apiClient, { unwrap } from './client';
import type { BalancesHorizonResponse, BalancesResponse } from '@/types';

export async function getBalances(month: number, year: number): Promise<BalancesResponse> {
  return unwrap(apiClient.get('/balances', { params: { month, year } }));
}

export async function getBalancesHorizon(year: number): Promise<BalancesHorizonResponse> {
  return unwrap(apiClient.get('/balances/horizon', { params: { year } }));
}
