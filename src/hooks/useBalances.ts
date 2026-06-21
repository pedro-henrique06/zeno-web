import { useQuery } from '@tanstack/react-query';
import * as balanceApi from '@/api/balance';

export function useBalances(month: number, year: number) {
  return useQuery({
    queryKey: ['balances', month, year],
    queryFn: () => balanceApi.getBalances(month, year),
  });
}
