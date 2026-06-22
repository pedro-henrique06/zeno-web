import { useQuery } from '@tanstack/react-query';
import * as summaryApi from '@/api/summary';

export function useSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['summary', month, year],
    queryFn: () => summaryApi.getSummary(month, year),
  });
}

export function useEconomizedHorizon(year: number, enabled: boolean) {
  return useQuery({
    queryKey: ['economized-horizon', year],
    queryFn: () => summaryApi.getEconomizedHorizon(year),
    enabled,
  });
}

export function usePerformanceHorizon(year: number, enabled: boolean) {
  return useQuery({
    queryKey: ['performance-horizon', year],
    queryFn: () => summaryApi.getPerformanceHorizon(year),
    enabled,
  });
}

export function useCostOfLivingHorizon(year: number, enabled: boolean) {
  return useQuery({
    queryKey: ['cost-of-living-horizon', year],
    queryFn: () => summaryApi.getCostOfLivingHorizon(year),
    enabled,
  });
}

export function useDailyAverageHorizon(year: number, enabled: boolean) {
  return useQuery({
    queryKey: ['daily-average-horizon', year],
    queryFn: () => summaryApi.getDailyAverageHorizon(year),
    enabled,
  });
}
