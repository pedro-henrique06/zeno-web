import apiClient, { unwrap } from './client';
import type { EconomizedHorizonResponse, SummaryResponse } from '@/types';

export async function getSummary(month: number, year: number): Promise<SummaryResponse> {
  return unwrap(apiClient.get('/summary', { params: { month, year } }));
}

export async function getEconomizedHorizon(year: number): Promise<EconomizedHorizonResponse> {
  return unwrap(apiClient.get('/summary/horizon', { params: { year } }));
}
