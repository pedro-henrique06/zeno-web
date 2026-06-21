import { useQuery } from '@tanstack/react-query';
import * as summaryApi from '@/api/summary';

export function useSummary(month: number, year: number) {
  return useQuery({
    queryKey: ['summary', month, year],
    queryFn: () => summaryApi.getSummary(month, year),
  });
}
