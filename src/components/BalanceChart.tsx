import ReactApexChart from 'react-apexcharts';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useUser';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import type { ApexOptions } from 'apexcharts';
import { alpha } from '@mui/material/styles';
import { brand } from '@/theme/tokens';
import type { Currency } from '@/types';

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
  currency?: Currency;
}

function fmtY(val: number, currency: Currency = 'BRL'): string {
  const abs = Math.abs(val);
  const sign = val < 0 ? '-' : '';
  const sym = CURRENCY_SYMBOLS[currency];
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
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];

  if (past.length < 2) return null;

  const hasFuture = future.length > 1;

  const series = hasFuture
    ? [
        { name: t('balances.chartPast'), data: past },
        { name: t('balances.chartFuture'), data: future },
      ]
    : [{ name: t('balances.chartPast'), data: past }];

  const labelColor = theme.palette.text.secondary;
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
    colors: hasFuture ? [brand.income, brand.teal] : [brand.income],
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
        style: { colors: labelColor, fontSize: '11px', fontFamily: '"DM Sans", sans-serif' },
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
      tooltip:    { enabled: false },
    },
    yaxis: {
      labels: {
        show: true,
        formatter: (val: number) => fmtY(val, currency),
        style: { colors: labelColor, fontSize: '11px', fontFamily: '"DM Sans", sans-serif' },
        offsetX: -4,
      },
    },
    grid: {
      borderColor: gridColor,
      padding: { left: 0, right: 6, top: -8, bottom: -4 },
    },
    dataLabels: { enabled: false },
    markers:    { size: 0, hover: { size: 5 } },
    legend: {
      show: hasFuture,
      position: 'top',
      horizontalAlign: 'right',
      fontSize: '12px',
      fontFamily: '"DM Sans", sans-serif',
      labels: { colors: labelColor },
      markers: { size: 5, offsetX: -2 },
      itemMargin: { horizontal: 8 },
    },
    tooltip: {
      theme: isDark ? 'dark' : 'light',
      shared: true,
      intersect: false,
      x: { format: 'dd MMM' },
      y: {
        formatter: (v: number) =>
          v.toLocaleString(locale, { style: 'currency', currency: currency ?? 'BRL' }),
      },
    },
    annotations: {
      xaxis: todayX != null
        ? [{
            x: todayX,
            borderColor: alpha(brand.income, 0.4),
            strokeDashArray: 4,
            label: {
              text: t('balances.chartToday'),
              position: 'top',
              borderColor: 'transparent',
              style: {
                color: alpha(brand.income, 0.9),
                background: 'transparent',
                fontSize: '11px',
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
              fillColor: brand.income,
              strokeColor: alpha(brand.income, 0.25),
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
