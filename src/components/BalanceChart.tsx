import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material';
import type { ApexOptions } from 'apexcharts';
import type { BalanceDay } from '@/types';

interface BalanceChartProps {
  days: BalanceDay[];
  height?: number;
}

export function BalanceChart({ days, height = 110 }: BalanceChartProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  if (days.length < 2) return null;

  /* ── split past / future ── */
  const todayI = days.findIndex((d) => d.isToday);
  const firstFutureI = days.findIndex((d) => d.isProjected);
  const splitI =
    todayI >= 0
      ? todayI
      : firstFutureI > 0
        ? firstFutureI - 1
        : days.length - 1;

  const hasFuture = splitI < days.length - 1;

  const pastData  = days.slice(0, splitI + 1).map((d) => ({ x: d.day, y: d.balance }));
  const futureData = hasFuture ? days.slice(splitI).map((d) => ({ x: d.day, y: d.balance })) : [];

  const todayDay     = todayI >= 0 ? days[todayI].day     : null;
  const todayBalance = todayI >= 0 ? days[todayI].balance : null;

  /* ── series ── */
  const series = hasFuture
    ? [
        { name: 'Realizado', data: pastData },
        { name: 'Projetado', data: futureData },
      ]
    : [{ name: 'Realizado', data: pastData }];

  /* ── options ── */
  const gridColor = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';

  const options: ApexOptions = {
    chart: {
      type: 'area',
      height,
      toolbar: { show: false },
      zoom: { enabled: false },
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
      width: hasFuture ? [2.5, 2] : [2.5],
      dashArray: hasFuture ? [0, 6] : [0],
    },
    xaxis: {
      type: 'numeric',
      labels:      { show: false },
      axisBorder:  { show: false },
      axisTicks:   { show: false },
      tooltip:     { enabled: false },
    },
    yaxis: { labels: { show: false } },
    grid: {
      borderColor: gridColor,
      padding: { left: 0, right: 0, top: -10, bottom: -8 },
    },
    dataLabels: { enabled: false },
    markers:    { size: 0 },
    legend:     { show: false },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      x: { formatter: (v: number) => `Dia ${Math.round(v)}` },
      y: {
        formatter: (v: number) =>
          `R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      },
    },
    annotations: {
      xaxis: todayDay != null
        ? [{
            x: todayDay,
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
      points: todayDay != null && todayBalance != null
        ? [{
            x: todayDay,
            y: todayBalance,
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
