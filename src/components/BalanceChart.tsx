import type { BalanceDay } from '@/types';

interface BalanceChartProps {
  days: BalanceDay[];
  height?: number;
}

/** Build a smooth cubic-bezier SVG path through a list of [x,y] points */
function smoothPath(pts: [number, number][]): string {
  if (pts.length === 0) return '';
  if (pts.length === 1) return `M ${pts[0][0]} ${pts[0][1]}`;
  const d: string[] = [`M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`];
  for (let i = 1; i < pts.length; i++) {
    const [px, py] = pts[i - 1];
    const [cx, cy] = pts[i];
    const dx = (cx - px) * 0.4;
    d.push(
      `C ${(px + dx).toFixed(2)} ${py.toFixed(2)}, ${(cx - dx).toFixed(2)} ${cy.toFixed(2)}, ${cx.toFixed(2)} ${cy.toFixed(2)}`,
    );
  }
  return d.join(' ');
}

/** Build the closed area fill path (line + back along zero) */
function areaPath(pts: [number, number][], zeroY: number): string {
  if (pts.length < 2) return '';
  const line = smoothPath(pts);
  const [lastX] = pts[pts.length - 1];
  const [firstX] = pts[0];
  return `${line} L ${lastX.toFixed(2)} ${zeroY.toFixed(2)} L ${firstX.toFixed(2)} ${zeroY.toFixed(2)} Z`;
}

export function BalanceChart({ days, height = 110 }: BalanceChartProps) {
  if (days.length < 2) return null;

  const W = 400;
  const H = height;
  const PX = 6;
  const PY = 12;

  // Position X by actual day number (day 1..maxDay)
  const maxDay = Math.max(...days.map((d) => d.day));
  const xOfDay = (day: number) =>
    PX + ((day - 1) / Math.max(maxDay - 1, 1)) * (W - PX * 2);

  const vals = days.map((d) => d.balance);
  const rawMin = Math.min(...vals, 0);
  const rawMax = Math.max(...vals, 0);
  // Add vertical padding so the line never touches the edge
  const vPad = Math.max((rawMax - rawMin) * 0.15, 200);
  const minV = rawMin - vPad;
  const maxV = rawMax + vPad;
  const range = maxV - minV || 1;

  const yOf = (v: number) => H - PY - ((v - minV) / range) * (H - PY * 2);
  const zeroY = yOf(0);

  // Split at today (inclusive) / first projected
  const todayI = days.findIndex((d) => d.isToday);
  const firstFutureI = days.findIndex((d) => d.isProjected);
  const splitI =
    todayI >= 0
      ? todayI
      : firstFutureI > 0
        ? firstFutureI - 1
        : days.length - 1;

  const pastDays = days.slice(0, splitI + 1);
  const futureDays = splitI < days.length - 1 ? days.slice(splitI) : [];

  const pastPts: [number, number][] = pastDays.map((d) => [xOfDay(d.day), yOf(d.balance)]);
  const futurePts: [number, number][] = futureDays.map((d) => [xOfDay(d.day), yOf(d.balance)]);

  const todayX = todayI >= 0 ? xOfDay(days[todayI].day) : null;
  const todayY = todayI >= 0 ? yOf(days[todayI].balance) : null;

  const gradPastId = 'zc-grad-past';
  const gradFutureId = 'zc-grad-future';

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height, display: 'block' }}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={gradPastId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E8A5E" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#1E8A5E" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id={gradFutureId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0CB89E" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#0CB89E" stopOpacity="0.01" />
        </linearGradient>
      </defs>

      {/* Zero baseline */}
      <line
        x1={PX}
        y1={zeroY.toFixed(2)}
        x2={W - PX}
        y2={zeroY.toFixed(2)}
        stroke="#E4E8EE"
        strokeWidth={1}
      />

      {/* Past gradient area */}
      {pastPts.length >= 2 && (
        <path
          d={areaPath(pastPts, zeroY)}
          fill={`url(#${gradPastId})`}
        />
      )}

      {/* Past smooth line */}
      {pastPts.length >= 2 && (
        <path
          d={smoothPath(pastPts)}
          fill="none"
          stroke="#1E8A5E"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      )}

      {/* Future gradient area */}
      {futurePts.length >= 2 && (
        <path
          d={areaPath(futurePts, zeroY)}
          fill={`url(#${gradFutureId})`}
        />
      )}

      {/* Future dashed smooth line */}
      {futurePts.length >= 2 && (
        <path
          d={smoothPath(futurePts)}
          fill="none"
          stroke="#0CB89E"
          strokeWidth={2}
          strokeDasharray="6 4"
          strokeLinecap="round"
        />
      )}

      {/* Today vertical marker */}
      {todayX !== null && (
        <line
          x1={todayX.toFixed(2)}
          y1={PY}
          x2={todayX.toFixed(2)}
          y2={H - PY}
          stroke="#1B3D6B"
          strokeWidth={1.5}
          strokeDasharray="3 3"
          strokeOpacity={0.4}
        />
      )}

      {/* Today dot */}
      {todayX !== null && todayY !== null && (
        <>
          <circle cx={todayX} cy={todayY} r={5} fill="#1E8A5E" />
          <circle cx={todayX} cy={todayY} r={3} fill="white" />
        </>
      )}
    </svg>
  );
}
