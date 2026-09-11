import { useState } from 'react';
import { Box, Typography, Paper, Button, CircularProgress } from '@mui/material';
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
    <Box
      sx={{
        flex: 1,
        p: 1.75,
        borderRadius: 3,
        bgcolor: bgColor,
      }}
    >
      <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'text.disabled', display: 'block', mb: 0.75 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontSize: '1.55rem',
          fontWeight: 700,
          color,
          fontVariantNumeric: 'tabular-nums',
          lineHeight: 1.1,
        }}
      >
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
        '&:hover': onClick ? { bgcolor: 'action.hover' } : {},
      }}
      onClick={onClick}
    >
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontSize: '1.2rem',
          fontWeight: 700,
          mb: 0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: subColor, fontWeight: 600 }}>
        {subLabel}
      </Typography>
    </Paper>
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
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
          {label}
        </Typography>
        <Typography
          variant="body2"
          sx={{ fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}
        >
          {formatCurrency(total, currency, language)}
        </Typography>
      </Box>
      <Box
        sx={{
          height: 6,
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
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
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
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem', fontWeight: 600, color: 'text.primary', lineHeight: 1.2 }}>
          {t('dashboard.title')}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: 'text.disabled', mt: 0.25 }}>
          {t('dashboard.subtitle', { month: new Date(year, month - 1).toLocaleString('default', { month: 'long' }) })}
        </Typography>
      </Box>

      {/* Big income / expense tiles */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <BigTile
          label={t('dashboard.income')}
          value={movements.entrada}
          color="#1E8A5E"
          bgColor="#E8F5EE"
          currency={profile?.currency}
          language={profile?.language}
        />
        <BigTile
          label={t('dashboard.expenses')}
          value={movements.saida + movements.cartao}
          color="#D94F3D"
          bgColor="#FBEAE8"
          currency={profile?.currency}
          language={profile?.language}
        />
      </Box>

      {/* Stat cards */}
      <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, fontWeight: 700, display: 'block', mb: 1 }}>
        {t('dashboard.monthlyCalculations')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1.5, mb: 3 }}>
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
          subLabel={economizedPercent > 0 ? t('dashboard.saved') : t('dashboard.nothingSaved')}
          subColor={economizedPercent > 0 ? 'success.main' : 'text.secondary'}
          onClick={() => setEconomizedOpen(true)}
        />
        <StatCard
          label={t('dashboard.costOfLiving')}
          value={formatCurrency(costOfLiving, profile?.currency, profile?.language)}
          subLabel={t('dashboard.costOfLiving')}
          subColor="text.secondary"
          onClick={() => setCostOfLivingOpen(true)}
        />
        <StatCard
          label={t('dashboard.dailyAverage')}
          value={formatCurrency(dailyAverageReal, profile?.currency, profile?.language)}
          subLabel={t('dashboard.dailyAverage')}
          subColor="text.secondary"
          onClick={() => setDailyAverageOpen(true)}
        />
      </Box>

      {/* Movement bars */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('dashboard.monthMovements')}
          </Typography>
          <Button size="small" onClick={() => navigate(`/entries?month=${month}&year=${year}`)}>
            {t('dashboard.seeAll')}
          </Button>
        </Box>

        <MovementBar kind={EntryKind.Entrada} label={t('dashboard.income')} total={movements.entrada} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Saida} label={t('dashboard.expenses')} total={movements.saida} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Diario} label={t('dashboard.daily')} total={movements.diario} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Economia} label={t('dashboard.savings')} total={movements.economia} max={totalMovement} currency={profile?.currency} language={profile?.language} />
        <MovementBar kind={EntryKind.Cartao} label={t('dashboard.cardSpending')} total={movements.cartao} max={totalMovement} currency={profile?.currency} language={profile?.language} />
      </Paper>

      {/* Saldo do mês */}
      <Paper sx={{ borderRadius: 3, p: 2, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mt: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '13px', color: 'text.secondary', fontWeight: 500 }}>
          {t('dashboard.monthBalance')}
        </Typography>
        <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.35rem', fontWeight: 700, color: performance >= 0 ? '#1E8A5E' : '#D94F3D', fontVariantNumeric: 'tabular-nums' }}>
          {performance >= 0 ? '+' : ''}{formatCurrency(performance, profile?.currency, profile?.language)}
        </Typography>
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
