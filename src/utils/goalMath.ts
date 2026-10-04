/** Monthly rate equivalent to an annual percentage rate (compound). */
export function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/**
 * Months needed to reach `fv` starting with `initial` already saved and
 * contributing `pmt` per month at `annualPct` % a.a.
 *
 * Solves  initial·x + pmt·(x − 1)/r = fv  for x = (1 + r)^n.
 */
export function monthsToGoal(fv: number, pmt: number, annualPct: number, initial = 0): number {
  if (fv <= 0) return Infinity;
  if (initial >= fv) return 0;
  if (pmt <= 0) return Infinity;
  const r = monthlyRate(annualPct);
  if (r === 0) return (fv - initial) / pmt;
  const k = pmt / r;
  const x = (fv + k) / (initial + k);
  if (x <= 0) return Infinity;
  return Math.log(x) / Math.log(1 + r);
}

/** Future value of `initial` plus `pmt` per month for `n` months at `annualPct` % a.a. */
export function futureValue(pmt: number, n: number, annualPct: number, initial = 0): number {
  const r = monthlyRate(annualPct);
  if (r === 0) return initial + pmt * n;
  const growth = Math.pow(1 + r, n);
  return initial * growth + pmt * ((growth - 1) / r);
}

/** Brazilian income tax bracket on investment earnings by holding period. */
export function irRate(months: number): number {
  if (months <= 6) return 0.225;
  if (months <= 12) return 0.2;
  if (months <= 24) return 0.175;
  return 0.15;
}

export function formatMonths(n: number): string {
  if (!isFinite(n)) return '—';
  const total = Math.round(n);
  const y = Math.floor(total / 12);
  const m = total % 12;
  if (y === 0) return `${m}m`;
  if (m === 0) return `${y}a`;
  return `${y}a ${m}m`;
}
