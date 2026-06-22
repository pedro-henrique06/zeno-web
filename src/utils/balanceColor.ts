export function getBalanceColor(value: number): string {
  if (value <= 0) return 'error.main';
  if (value < 10000) return 'warning.main';
  return 'success.main';
}
