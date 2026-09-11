import type { BalanceDay } from '@/types';
import {
  ChartsContainer,
  ChartsGrid,
  ChartsXAxis,
  ChartsReferenceLine,
} from '@mui/x-charts';
import { LinePlot, AreaPlot, MarkPlot } from '@mui/x-charts/LineChart';
import { useTheme } from '@mui/material/styles';

interface BalanceChartProps {
  days: BalanceDay[];
  height?: number;
}

export function BalanceChart({ days, height = 110 }: BalanceChartProps) {
  const theme = useTheme();
  if (days.length < 2) return null;

  // Determine split point: today index (inclusive in past) or last non-projected
  const todayI = days.findIndex((d) => d.isToday);
  const firstFutureI = days.findIndex((d) => d.isProjected);
  const splitI =
    todayI >= 0
      ? todayI
      : firstFutureI > 0
        ? firstFutureI - 1
        : days.length - 1;

  const xData = days.map((d) => d.day);

  // Past series: values up to splitI, null beyond
  const pastValues: (number | null)[] = days.map((d, i) =>
    i <= splitI ? d.balance : null,
  );
  // Future series: null before splitI, values from splitI onwards (shared point for smooth join)
  const futureValues: (number | null)[] = days.map((d, i) =>
    i >= splitI ? d.balance : null,
  );

  const hasFuture = splitI < days.length - 1;
  const todayDay = todayI >= 0 ? days[todayI].day : null;

  const isDark = theme.palette.mode === 'dark';
  const gridColor = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  const axisLabelColor = theme.palette.text.disabled as string;

  const series = [
    {
      id: 'past',
      type: 'line' as const,
      data: pastValues,
      color: '#1E8A5E',
      area: true,
      showMark: false,
      curve: 'monotoneX' as const,
      connectNulls: false,
      valueFormatter: (v: number | null) => (v == null ? '' : String(v)),
    },
    ...(hasFuture
      ? [
          {
            id: 'future',
            type: 'line' as const,
            data: futureValues,
            color: '#0CB89E',
            area: true,
            showMark: ({ index }: { index: number }) => index === splitI,
            curve: 'monotoneX' as const,
            connectNulls: false,
            valueFormatter: (v: number | null) => (v == null ? '' : String(v)),
          },
        ]
      : []),
  ];

  return (
    <ChartsContainer
      series={series}
      xAxis={[
        {
          id: 'day',
          data: xData,
          scaleType: 'linear',
          disableTicks: true,
          tickLabelStyle: {
            fontSize: 9,
            fill: axisLabelColor,
            fontFamily: 'DM Sans, sans-serif',
          },
        },
      ]}
      yAxis={[{ id: 'balance' }]}
      height={height}
      margin={{ top: 8, right: 8, bottom: 22, left: 4 }}
      sx={{
        '& .MuiChartsGrid-line': {
          stroke: gridColor,
          strokeDasharray: 'none',
        },
        '& .MuiChartsAxis-bottom .MuiChartsAxis-line': {
          stroke: 'transparent',
        },
        '& .MuiLineElement-series-past': {
          strokeWidth: 2.5,
        },
        '& .MuiLineElement-series-future': {
          strokeWidth: 2,
          strokeDasharray: '6 4',
        },
        '& .MuiAreaElement-series-past': {
          fillOpacity: 0.18,
        },
        '& .MuiAreaElement-series-future': {
          fillOpacity: 0.08,
        },
        '& .MuiMarkElement-series-future': {
          fill: '#0CB89E',
          stroke: '#0CB89E',
        },
      }}
    >
      <ChartsGrid horizontal />
      <AreaPlot />
      <LinePlot />
      <MarkPlot />
      <ChartsXAxis axisId="day" disableTicks />
      {todayDay !== null && (
        <ChartsReferenceLine
          x={todayDay}
          lineStyle={{
            stroke: 'rgba(12,184,158,0.4)',
            strokeWidth: 1,
            strokeDasharray: '4 3',
          }}
          labelStyle={{
            fontSize: 9,
            fill: 'rgba(12,184,158,0.8)',
            fontFamily: 'DM Sans, sans-serif',
            fontWeight: 700,
          }}
          label="HOJE"
          labelAlign="start"
        />
      )}
    </ChartsContainer>
  );
}
