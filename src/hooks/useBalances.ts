import { useQuery } from '@tanstack/react-query';
import * as balanceApi from '@/api/balance';

export function useBalances(month: number, year: number) {
  return useQuery({
    queryKey: ['balances', month, year],
    queryFn: () => balanceApi.getBalances(month, year),
  });
}

export function useBalancesHorizon(year: number, enabled: boolean) {
  return useQuery({
    queryKey: ['balances-horizon', year],
    queryFn: () => balanceApi.getBalancesHorizon(year),
    enabled,
  });
}
