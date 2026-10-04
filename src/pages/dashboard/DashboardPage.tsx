import { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSummary } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import type { Currency, Language } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { StickyHeader } from '@/components/layout/StickyHeader';
import { EntryKindColors } from '@/utils/entryKind';
import { EconomizedHorizonDialog } from '@/components/EconomizedHorizonDialog';
import { PerformanceHorizonDialog } from '@/components/PerformanceHorizonDialog';
import { CostOfLivingHorizonDialog } from '@/components/CostOfLivingHorizonDialog';
import { DailyAverageHorizonDialog } from '@/components/DailyAverageHorizonDialog';
import { brand } from '@/theme/tokens';
import { clickableProps } from '@/utils/a11y';
import { DashboardSkeleton } from '@/components/Skeletons';

/** The one hero card: month balance with income / expense underneath */
function HeroCard({
  label,
  hint,
  balance,
  income,
  expenses,
  incomeLabel,
  expensesLabel,
  currency,
  language,
  onClick,
}: {
  label: string;
  hint: string;
  balance: number;
  income: number;
  expenses: number;
  incomeLabel: string;
  expensesLabel: string;
  currency?: Currency;
  language?: Language;
  onClick: () => void;
}) {
  const positive = balance >= 0;
  return (
    <Paper
      {...clickableProps(onClick)}
      sx={{
        p: 2.5,
        mb: 2,
        borderRadius: 4,
        bgcolor: brand.navy,
        boxShadow: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontSize: '2.25rem',
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-0.5px',
          color: '#FFFFFF',
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {positive ? '+' : ''}{formatCurrency(balance, currency, language)}
      </Typography>
      <Typography sx={{ fontSize: '12px', fontWeight: 600, color: positive ? brand.income : brand.expense, mt: 0.5 }}>
        {hint}
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 2, pt: 2, borderTop: '1px solid rgba(255,255,255,0.12)' }}>
        {[
          { l: incomeLabel, v: income, c: brand.income },
          { l: expensesLabel, v: expenses, c: brand.expense },
        ].map(({ l, v, c }) => (
          <Box key={l} sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)' }}>
              {l}
            </Typography>
            <Typography
              sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.2rem', fontWeight: 600, color: c, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
            >
              {formatCurrency(v, currency, language)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/** A tappable row of the monthly calculations list (no box of its own) */
function StatRow({
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
  onClick: () => void;
}) {
  return (
    <Box
      {...clickableProps(onClick)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        px: 2,
        py: 1.5,
        cursor: 'pointer',
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: 'action.hover' },
        '& + &': { borderTop: '1px solid', borderColor: 'divider' },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: '14px', fontWeight: 600 }}>{label}</Typography>
        <Typography sx={{ fontSize: '12px', color: subColor, fontWeight: 500 }}>{subLabel}</Typography>
      </Box>
      <Typography
        sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
      >
        {value}
      </Typography>
    </Box>
  );
}

/** Horizontal bar showing a movement kind as a proportion of total */
function MovementBar({
  kind,
  label,
  total,
  max,
  currency,
  language,
}: {
  kind: number;
  label: string;
  total: number;
  max: number;
  currency?: Currency;
  language?: Language;
}) {
  const pct = max > 0 ? Math.min((total / max) * 100, 100) : 0;
  const color = EntryKindColors[kind as 0 | 1 | 2 | 3 | 4];

  return (
    <Box sx={{ py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', fontSize: '0.82rem' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums', fontSize: '0.82rem' }}
        >
          {formatCurrency(total, currency, language)}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 5,
          borderRadius: 3,
          bgcolor: 'action.hover',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            height: '100%',
            width: `${pct}%`,
            borderRadius: 3,
            bgcolor: color,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
    </Box>
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

  const { data, isLoading, isError } = useSummary(month, year);

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">{t('dashboard.loadError')}</Typography>
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box sx={{ mt: 2 }}>
        <DashboardSkeleton />
      </Box>
    );
  }

  const { performance, economizedPercent, costOfLiving, dailyAverageReal, movements } = data;
  const totalMovement = Math.max(
    movements.entrada,
    movements.saida,
    movements.diario,
    movements.economia,
    movements.cartao,
    1,
  );

  return (
    <Box>
      <StickyHeader>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />
      </StickyHeader>

      {/* Page header */}
      <Box sx={{ mb: 2, mt: 0.5 }}>
        <Typography
          sx={{
            fontFamily: '"Fraunces", serif',
            fontSize: '2rem',
            fontWeight: 300,
            fontStyle: 'italic',
            color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.15)',
            lineHeight: 1,
            letterSpacing: '-1px',
          }}
        >
          {t('dashboard.title')}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: 'text.secondary', mt: 0.25 }}>
          {t('dashboard.subtitle', { month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) })}
        </Typography>
      </Box>

      {/* Hero: month balance + income / expenses */}
      <HeroCard
        label={t('dashboard.monthBalance')}
        hint={performance >= 0 ? t('dashboard.moneyLeftOver') : t('dashboard.moneyShort')}
        balance={performance}
        income={movements.entrada}
        expenses={movements.saida + movements.cartao}
        incomeLabel={t('dashboard.income')}
        expensesLabel={t('dashboard.expenses')}
        currency={profile?.currency}
        language={profile?.language}
        onClick={() => setPerformanceOpen(true)}
      />

      {/* Monthly calculations: one list, no per-item boxes */}
      <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, fontWeight: 700, display: 'block', mb: 1, fontSize: '11px', letterSpacing: '.08em' }}>
        {t('dashboard.monthlyCalculations')}
      </Typography>
      <Paper sx={{ borderRadius: 3, mb: 2.5, border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}>
        <StatRow
          label={t('dashboard.saved')}
          value={`${economizedPercent.toFixed(1)}%`}
          subLabel={economizedPercent > 0 ? t('dashboard.savedHint') : t('dashboard.nothingSaved')}
          subColor={economizedPercent > 0 ? 'success.main' : 'text.secondary'}
          onClick={() => setEconomizedOpen(true)}
        />
        <StatRow
          label={t('dashboard.costOfLiving')}
          value={formatCurrency(costOfLiving, profile?.currency, profile?.language)}
          subLabel={t('dashboard.costOfLivingHint')}
          subColor="text.secondary"
          onClick={() => setCostOfLivingOpen(true)}
        />
        <StatRow
          label={t('dashboard.dailyAverage')}
          value={formatCurrency(dailyAverageReal, profile?.currency, profile?.language)}
          subLabel={t('dashboard.dailyAverageHint')}
          subColor="text.secondary"
          onClick={() => setDailyAverageOpen(true)}
        />
      </Paper>

      {/* Movement bars — POR CATEGORIA */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'text.secondary' }}>
            {t('dashboard.monthMovements')}
          </Typography>
          <Button size="small" sx={{ color: brand.blue, fontWeight: 600, fontSize: '0.78rem', p: '2px 8px' }} onClick={() => navigate(`/entries?month=${month}&year=${year}`)}>
            {t('dashboard.seeAll')}
          </Button>
        </Box>

        <MovementBar kind={EntryKind.Entrada} label={t('dashboard.income')} total={movements.entrada} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Saida} label={t('dashboard.expenses')} total={movements.saida} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Diario} label={t('dashboard.daily')} total={movements.diario} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Economia} label={t('dashboard.savings')} total={movements.economia} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Cartao} label={t('dashboard.cardSpending')} total={movements.cartao} max={totalMovement} currency={profile?.currency} language={profile?.language} />
      </Paper>

      <EconomizedHorizonDialog
        key={`economized-${year}`}
        open={economizedOpen}
        onClose={() => setEconomizedOpen(false)}
        initialYear={year}
      />
      <PerformanceHorizonDialog
        key={`performance-${year}`}
        open={performanceOpen}
        onClose={() => setPerformanceOpen(false)}
        initialYear={year}
      />
      <CostOfLivingHorizonDialog
        key={`cost-of-living-${year}`}
        open={costOfLivingOpen}
        onClose={() => setCostOfLivingOpen(false)}
        initialYear={year}
      />
      <DailyAverageHorizonDialog
        key={`daily-average-${year}`}
        open={dailyAverageOpen}
        onClose={() => setDailyAverageOpen(false)}
        initialYear={year}
      />
    </Box>
  );
}
