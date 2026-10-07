import apiClient, { unwrap } from './client';
import type {
  CostOfLivingHorizonResponse,
  DailyAverageHorizonResponse,
  EconomizedHorizonResponse,
  PerformanceHorizonResponse,
  SummaryResponse,
} from '@/types';

export async function getSummary(month: number, year: number): Promise<SummaryResponse> {
  return unwrap(apiClient.get('/summary', { params: { month, year } }));
}

export async function getEconomizedHorizon(year: number): Promise<EconomizedHorizonResponse> {
  return unwrap(apiClient.get('/summary/horizon', { params: { year } }));
}

export async function getPerformanceHorizon(year: number): Promise<PerformanceHorizonResponse> {
  return unwrap(apiClient.get('/summary/performance-horizon', { params: { year } }));
}

export async function getCostOfLivingHorizon(year: number): Promise<CostOfLivingHorizonResponse> {
  return unwrap(apiClient.get('/summary/cost-of-living-horizon', { params: { year } }));
}

export async function getDailyAverageHorizon(year: number): Promise<DailyAverageHorizonResponse> {
  return unwrap(apiClient.get('/summary/daily-average-horizon', { params: { year } }));
}
