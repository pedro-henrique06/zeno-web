export type BalanceTone = 'error' | 'warning' | 'success';

export function getBalanceTone(value: number): BalanceTone {
  if (value <= 0) return 'error';
  if (value < 10000) return 'warning';
  return 'success';
}

export function getBalanceColor(value: number): string {
  return `${getBalanceTone(value)}.main`;
}
