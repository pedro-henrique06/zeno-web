import { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSummary } from '@/hooks/useSummary';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import type { Currency, Language, SummaryResponse } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { StickyHeader } from '@/components/layout/StickyHeader';
import { EntryKindColors } from '@/utils/entryKind';
import { EconomizedHorizonDialog } from '@/components/EconomizedHorizonDialog';
import { PerformanceHorizonDialog } from '@/components/PerformanceHorizonDialog';
import { CostOfLivingHorizonDialog } from '@/components/CostOfLivingHorizonDialog';
import { DailyAverageHorizonDialog } from '@/components/DailyAverageHorizonDialog';
import { BarChart } from '@mui/x-charts/BarChart';

// Compute (month, year) at a given offset from current
function shiftedMonth(month: number, year: number, offset: number) {
  const d = new Date(year, month - 1 - offset, 1);
  return { month: d.getMonth() + 1, year: d.getFullYear() };
}

function monthLabel(month: number, year: number) {
  const s = new Date(year, month - 1, 1).toLocaleString('pt-BR', { month: 'short' });
  return s.charAt(0).toUpperCase() + s.slice(1).replace('.', '');
}

/** Large two-tone income / expense tile */
function BigTile({
  label,
  value,
  color,
  bgColor,
  currency,
  language,
}: {
  label: string;
  value: number;
  color: string;
  bgColor: string;
  currency?: Currency;
  language?: Language;
}) {
  return (
    <Box sx={{ flex: 1, p: 1.75, borderRadius: 3, bgcolor: bgColor }}>
      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'text.disabled', display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.55rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>
        {formatCurrency(value, currency, language)}
      </Typography>
    </Box>
  );
}

function StatCard({
  label,
  value,
  subLabel,
  subColor,
  onClick,
}: {
  label: string;
  value: string;
  subLabel: string;
  subColor: 'success.main' | 'error.main' | 'text.secondary';
  onClick?: () => void;
}) {
  return (
    <Paper
      sx={{
        p: 2,
        borderRadius: 3,
        cursor: onClick ? 'pointer' : 'default',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: 'none',
        transition: 'background-color 0.15s',
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={onClick}
    >
      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'text.disabled', mb: 0.75 }}>
        {label}
      </Typography>
      <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.2rem', fontWeight: 700, mb: 0.5, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>
        {value}
      </Typography>
      <Typography sx={{ fontSize: '11px', color: subColor, fontWeight: 600 }}>
        {subLabel}
      </Typography>
    </Paper>
  );
}

/** Horizontal bar */
function HBar({
  label,
  total,
  max,
  color,
  currency,
  language,
}: {
  label: string;
  total: number;
  max: number;
  color: string;
  currency?: Currency;
  language?: Language;
}) {
  const pct = max > 0 ? Math.min((total / max) * 100, 100) : 0;
  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
          {formatCurrency(total, currency, language)}
        </Typography>
      </Box>
      <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', overflow: 'hidden' }}>
        <Box sx={{ height: '100%', width: `${pct}%`, borderRadius: 3, bgcolor: color, transition: 'width 0.4s ease' }} />
      </Box>
    </Box>
  );
}

/** 6-month bar chart — income vs expenses */
function MonthlyBarChart({
  history,
  currency,
  language,
}: {
  history: { label: string; income: number; expense: number }[];
  currency?: Currency;
  language?: Language;
}) {
  const isDark = typeof window !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark';
  const axisColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.35)';

  const fmt = (v: number | null) => (v == null ? '' : formatCurrency(v, currency, language));

  return (
    <BarChart
      height={160}
      series={[
        {
          data: history.map((h) => h.income),
          label: 'Entradas',
          color: '#1E8A5E',
          valueFormatter: fmt,
        },
        {
          data: history.map((h) => h.expense),
          label: 'Saídas',
          color: '#D94F3D',
          valueFormatter: fmt,
        },
      ]}
      xAxis={[{
        data: history.map((h) => h.label),
        scaleType: 'band',
        disableTicks: true,
        tickLabelStyle: { fontSize: 10, fill: axisColor, fontFamily: 'DM Sans, sans-serif' },
      }]}
      yAxis={[{ disableLine: true, disableTicks: true, tickLabelStyle: { fill: 'transparent' } }]}
      slots={{ legend: () => null }}
      margin={{ top: 8, right: 4, bottom: 28, left: 4 }}
      borderRadius={4}
      sx={{
        width: '100%',
        '& .MuiChartsAxis-bottom .MuiChartsAxis-line': { stroke: 'transparent' },
        '& .MuiChartsAxis-left .MuiChartsAxis-line': { stroke: 'transparent' },
      }}
    />
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [economizedOpen, setEconomizedOpen] = useState(false);
  const [performanceOpen, setPerformanceOpen] = useState(false);
  const [costOfLivingOpen, setCostOfLivingOpen] = useState(false);
  const [dailyAverageOpen, setDailyAverageOpen] = useState(false);

  // Current month summary
  const { data, isLoading, isError } = useSummary(month, year);

  // Historical summaries for chart (always called — hooks must not be conditional)
  const pm1 = shiftedMonth(month, year, 1);
  const pm2 = shiftedMonth(month, year, 2);
  const pm3 = shiftedMonth(month, year, 3);
  const pm4 = shiftedMonth(month, year, 4);
  const pm5 = shiftedMonth(month, year, 5);
  const { data: hd1 } = useSummary(pm1.month, pm1.year);
  const { data: hd2 } = useSummary(pm2.month, pm2.year);
  const { data: hd3 } = useSummary(pm3.month, pm3.year);
  const { data: hd4 } = useSummary(pm4.month, pm4.year);
  const { data: hd5 } = useSummary(pm5.month, pm5.year);

  // Entries + tags for category breakdown
  const { data: entriesData } = useEntries(month, year);
  const { data: tags } = useTags();

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{t('dashboard.loadError')}</Typography>
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { performance, economizedPercent, costOfLiving, dailyAverageReal, movements } = data;
  const totalMovement = Math.max(movements.entrada, movements.saida, movements.diario, movements.economia, movements.cartao, 1);

  // Build 6-month history for chart
  const historySlots: { pm: { month: number; year: number }; d: SummaryResponse | undefined }[] = [
    { pm: pm5, d: hd5 },
    { pm: pm4, d: hd4 },
    { pm: pm3, d: hd3 },
    { pm: pm2, d: hd2 },
    { pm: pm1, d: hd1 },
    { pm: { month, year }, d: data },
  ];
  const history = historySlots.map(({ pm: p, d }) => ({
    label: monthLabel(p.month, p.year),
    income: d?.movements.entrada ?? 0,
    expense: d ? (d.movements.saida + d.movements.cartao + d.movements.diario) : 0,
  }));

  // Category breakdown — group expenses by tag
  const tagMap = new Map((tags ?? []).map((tg) => [tg.id, tg.name]));
  const entries = entriesData?.items ?? [];
  const expenseEntries = entries.filter(
    (e) => e.kind === EntryKind.Saida || e.kind === EntryKind.Diario || e.kind === EntryKind.Cartao,
  );
  const categoryMap = new Map<string, { name: string; total: number }>();
  for (const e of expenseEntries) {
    const key = e.tagId ?? '__none__';
    const name = e.tagId ? (tagMap.get(e.tagId) ?? t('common.noTag')) : t('common.noTag');
    const prev = categoryMap.get(key) ?? { name, total: 0 };
    categoryMap.set(key, { name, total: prev.total + e.value });
  }
  const categoryTotals = Array.from(categoryMap.values())
    .sort((a, b) => b.total - a.total)
    .slice(0, 7);
  const maxCategory = Math.max(...categoryTotals.map((c) => c.total), 1);

  // Tag colors (cycle through palette)
  const TAG_COLORS = ['#1E8A5E', '#0CB89E', '#1B3D6B', '#7C5CBF', '#E08B42', '#3B82F6', '#D94F3D'];

  return (
    <Box>
      <StickyHeader>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </StickyHeader>

      {/* Page header */}
      <Box sx={{ mb: 2, mt: 0.5 }}>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
          {t('dashboard.title')}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: 'text.disabled', mt: 0.25 }}>
          {t('dashboard.subtitle', { month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) })}
        </Typography>
      </Box>

      {/* Big income / expense tiles */}
      <Box sx={{ display: 'flex', gap: 1.5, mb: 2 }}>
        <BigTile label={t('dashboard.income')} value={movements.entrada} color="#1E8A5E" bgColor="#E8F5EE" currency={profile?.currency} language={profile?.language} />
        <BigTile label={t('dashboard.expenses')} value={movements.saida + movements.cartao} color="#D94F3D" bgColor="#FBEAE8" currency={profile?.currency} language={profile?.language} />
      </Box>

      {/* Stat cards */}
      <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, fontWeight: 700, display: 'block', mb: 1 }}>
        {t('dashboard.monthlyCalculations')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 2.5 }}>
        <StatCard
          label={t('dashboard.performance')}
          value={formatCurrency(performance, profile?.currency, profile?.language)}
          subLabel={performance >= 0 ? t('dashboard.moneyLeftOver') : t('dashboard.moneyShort')}
          subColor={performance >= 0 ? 'success.main' : 'error.main'}
          onClick={() => setPerformanceOpen(true)}
        />
        <StatCard
          label={t('dashboard.saved')}
          value={`${economizedPercent.toFixed(1)}%`}
          subLabel={economizedPercent > 0 ? t('dashboard.savedHint') : t('dashboard.nothingSaved')}
          subColor={economizedPercent > 0 ? 'success.main' : 'text.secondary'}
          onClick={() => setEconomizedOpen(true)}
        />
        <StatCard
          label={t('dashboard.costOfLiving')}
          value={formatCurrency(costOfLiving, profile?.currency, profile?.language)}
          subLabel={t('dashboard.costOfLivingHint')}
          subColor="text.secondary"
          onClick={() => setCostOfLivingOpen(true)}
        />
        <StatCard
          label={t('dashboard.dailyAverage')}
          value={formatCurrency(dailyAverageReal, profile?.currency, profile?.language)}
          subLabel={t('dashboard.dailyAverageHint')}
          subColor="text.secondary"
          onClick={() => setDailyAverageOpen(true)}
        />
      </Box>

      {/* 6-month bar chart */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 2 }}>
        <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'text.disabled', mb: 0.5 }}>
          {t('dashboard.lastSixMonths')}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#1E8A5E' }} />
            <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 600 }}>{t('dashboard.income')}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: 1, bgcolor: '#D94F3D' }} />
            <Typography sx={{ fontSize: '10px', color: 'text.secondary', fontWeight: 600 }}>{t('dashboard.expenses')}</Typography>
          </Box>
        </Box>
        <MonthlyBarChart history={history} currency={profile?.currency} language={profile?.language} />
      </Paper>

      {/* Movement bars */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 1.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('dashboard.monthMovements')}
          </Typography>
          <Button size="small" onClick={() => navigate(`/entries?month=${month}&year=${year}`)}>
            {t('dashboard.seeAll')}
          </Button>
        </Box>
        <HBar label={t('dashboard.income')} total={movements.entrada} max={totalMovement} color={EntryKindColors[EntryKind.Entrada]} currency={profile?.currency} language={profile?.language} />
        <HBar label={t('dashboard.expenses')} total={movements.saida} max={totalMovement} color={EntryKindColors[EntryKind.Saida]} currency={profile?.currency} language={profile?.language} />
        <HBar label={t('dashboard.daily')} total={movements.diario} max={totalMovement} color={EntryKindColors[EntryKind.Diario]} currency={profile?.currency} language={profile?.language} />
        <HBar label={t('dashboard.savings')} total={movements.economia} max={totalMovement} color={EntryKindColors[EntryKind.Economia]} currency={profile?.currency} language={profile?.language} />
        <HBar label={t('dashboard.cardSpending')} total={movements.cartao} max={totalMovement} color={EntryKindColors[EntryKind.Cartao]} currency={profile?.currency} language={profile?.language} />
      </Paper>

      {/* Por Categoria */}
      {categoryTotals.length > 0 && (
        <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 1.5 }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'text.disabled', mb: 1.5 }}>
            {t('dashboard.byCategory')}
          </Typography>
          {categoryTotals.map((cat, idx) => (
            <HBar
              key={cat.name}
              label={cat.name}
              total={cat.total}
              max={maxCategory}
              color={TAG_COLORS[idx % TAG_COLORS.length]}
              currency={profile?.currency}
              language={profile?.language}
            />
          ))}
        </Paper>
      )}

      {/* Saldo do mês */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mt: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '13px', color: 'text.secondary', fontWeight: 500 }}>
          {t('dashboard.monthBalance')}
        </Typography>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.35rem', fontWeight: 700, color: performance >= 0 ? '#1E8A5E' : '#D94F3D', fontVariantNumeric: 'tabular-nums' }}>
          {performance >= 0 ? '+' : ''}{formatCurrency(performance, profile?.currency, profile?.language)}
        </Typography>
      </Paper>

      <EconomizedHorizonDialog key={`economized-${year}`} open={economizedOpen} onClose={() => setEconomizedOpen(false)} initialYear={year} />
      <PerformanceHorizonDialog key={`performance-${year}`} open={performanceOpen} onClose={() => setPerformanceOpen(false)} initialYear={year} />
      <CostOfLivingHorizonDialog key={`cost-of-living-${year}`} open={costOfLivingOpen} onClose={() => setCostOfLivingOpen(false)} initialYear={year} />
      <DailyAverageHorizonDialog key={`daily-average-${year}`} open={dailyAverageOpen} onClose={() => setDailyAverageOpen(false)} initialYear={year} />
    </Box>
  );
}
