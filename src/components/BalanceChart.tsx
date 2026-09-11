import type { BalanceDay } from '@/types';

interface BalanceChartProps {
  days: BalanceDay[];
  height?: number;
}

export function BalanceChart({ days, height = 96 }: BalanceChartProps) {
  if (days.length < 2) return null;

  const W = 400;
  const H = height;
  const PX = 2;
  const PY = 10;

  const vals = days.map((d) => d.balance);
  const minV = Math.min(...vals, 0);
  const maxV = Math.max(...vals, 0);
  const range = maxV - minV || 1;

  const xOf = (i: number) => PX + (i / (days.length - 1)) * (W - PX * 2);
  const yOf = (v: number) => H - PY - ((v - minV) / range) * (H - PY * 2);

  const zeroY = yOf(0);

  const todayI = days.findIndex((d) => d.isToday);
  // splitI is where future begins
  const splitI =
    todayI >= 0
      ? todayI
      : days.findIndex((d) => d.isProjected) > 0
        ? days.findIndex((d) => d.isProjected) - 1
        : days.length - 1;

  const pastCount = Math.min(splitI + 1, days.length);
  const pastPts = days
    .slice(0, pastCount)
    .map((d, i) => `${xOf(i).toFixed(2)},${yOf(d.balance).toFixed(2)}`)
    .join(' ');

  const futurePts =
    splitI < days.length - 1
      ? days
          .slice(splitI)
          .map((d, i) => `${xOf(splitI + i).toFixed(2)},${yOf(d.balance).toFixed(2)}`)
          .join(' ')
      : '';

  const pastStartX = xOf(0);
  const pastEndX = xOf(pastCount - 1);
  const futureEndX = xOf(days.length - 1);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="none"
    >
      {/* Zero baseline */}
      <line
        x1={PX}
        y1={zeroY.toFixed(2)}
        x2={W - PX}
        y2={zeroY.toFixed(2)}
        stroke="#E4E8EE"
        strokeWidth={1}
      />

      {/* Past filled area */}
      {pastPts && (
        <polygon
          points={`${pastStartX},${zeroY.toFixed(2)} ${pastPts} ${pastEndX},${zeroY.toFixed(2)}`}
          fill="#1E8A5E"
          fillOpacity={0.13}
        />
      )}

      {/* Past line */}
      {pastPts && (
        <polyline
          points={pastPts}
          fill="none"
          stroke="#1E8A5E"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}

      {/* Future ghost area */}
      {futurePts && (
        <polygon
          points={`${xOf(splitI).toFixed(2)},${zeroY.toFixed(2)} ${futurePts} ${futureEndX},${zeroY.toFixed(2)}`}
          fill="#0CB89E"
          fillOpacity={0.07}
        />
      )}

      {/* Future dashed line */}
      {futurePts && (
        <polyline
          points={futurePts}
          fill="none"
          stroke="#0CB89E"
          strokeWidth={1.5}
          strokeDasharray="5 3"
          strokeLinecap="round"
        />
      )}

      {/* Today vertical marker */}
      {todayI >= 0 && (
        <line
          x1={xOf(todayI).toFixed(2)}
          y1={PY}
          x2={xOf(todayI).toFixed(2)}
          y2={H - PY}
          stroke="#1B3D6B"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          strokeOpacity={0.55}
        />
      )}
    </svg>
  );
}
