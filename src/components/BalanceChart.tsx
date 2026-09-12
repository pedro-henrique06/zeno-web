import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material';
import type { ApexOptions } from 'apexcharts';

export interface ChartPoint {
  x: number; // timestamp ms
  y: number;
}

interface BalanceChartProps {
  past: ChartPoint[];
  future: ChartPoint[];
  todayX?: number | null;
  todayY?: number | null;
  height?: number;
  currency?: string;
}

function fmtY(val: number, currency?: string): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : 'R$';
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000)     return `${sign}${sym}${(abs / 1_000).toFixed(abs >= 100_000 ? 0 : 1)}k`;
  return `${sign}${sym}${abs.toFixed(0)}`;
}

export function BalanceChart({
  past,
  future,
  todayX,
  todayY,
  height = 160,
  currency,
}: BalanceChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (past.length < 2) return null;

  const hasFuture = future.length > 1;

  const series = hasFuture
    ? [
        { name: 'Realizado', data: past },
        { name: 'Projetado', data: future },
      ]
    : [{ name: 'Realizado', data: past }];

  const labelColor = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(0,0,0,0.38)';
  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height,
      toolbar:    { show: false },
      zoom:       { enabled: false },
      background: 'transparent',
      fontFamily: '"DM Sans", sans-serif',
      animations: { enabled: true, speed: 700, easing: 'easeout' },
    },
    colors: hasFuture ? ['#2DC579', '#5ECCC8'] : ['#2DC579'],
    fill: {
      type: 'gradient',
      gradient: {
        type: 'vertical',
        shadeIntensity: 0,
        opacityFrom: 0.22,
        opacityTo: 0.01,
        stops: [0, 100],
      },
    },
    stroke: {
      curve: 'smooth',
      width:     hasFuture ? [2.5, 2] : [2.5],
      dashArray: hasFuture ? [0, 6]   : [0],
    },
    xaxis: {
      type: 'datetime',
      labels: {
        show: true,
        datetimeUTC: false,
        format: 'MMM',
        style: { colors: labelColor, fontSize: '9px', fontFamily: '"DM Sans", sans-serif' },
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
      tooltip:    { enabled: false },
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (val: number) => fmtY(val, currency),
        style: { colors: labelColor, fontSize: '9px', fontFamily: '"DM Sans", sans-serif' },
        offsetX: -4,
      },
    },
    grid: {
      borderColor: gridColor,
      padding: { left: 0, right: 6, top: -8, bottom: -4 },
    },
    dataLabels: { enabled: false },
    markers:    { size: 0 },
    legend:     { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: { format: 'dd MMM' },
      y: {
        formatter: (v: number) =>
          v.toLocaleString('pt-BR', {
            style: 'currency',
            currency: currency === 'USD' ? 'USD' : currency === 'EUR' ? 'EUR' : 'BRL',
          }),
      },
    },
    annotations: {
      xaxis: todayX != null
        ? [{
            x: todayX,
            borderColor: 'rgba(45,197,121,0.4)',
            strokeDashArray: 4,
            label: {
              text: 'HOJE',
              position: 'top',
              borderColor: 'transparent',
              style: {
                color: 'rgba(45,197,121,0.9)',
                background: 'transparent',
                fontSize: '9px',
                fontWeight: '700',
                fontFamily: '"DM Sans", sans-serif',
              },
            },
          }]
        : [],
      points: todayX != null && todayY != null
        ? [{
            x: todayX,
            y: todayY,
            marker: {
              size: 5,
              fillColor: '#2DC579',
              strokeColor: 'rgba(45,197,121,0.25)',
              strokeWidth: 7,
            },
            label: { text: '' },
          }]
        : [],
    },
    theme: { mode: isDark ? 'dark' : 'light' },
  };

  return (
    <ReactApexChart
      options={options}
      series={series}
      type="area"
      height={height}
    />
  );
}
