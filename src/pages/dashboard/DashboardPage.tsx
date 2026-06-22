import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSummary } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import type { Currency, Language } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EntryKindColors, EntryKindLetters } from '@/utils/entryKind';
import { EconomizedHorizonDialog } from '@/components/EconomizedHorizonDialog';
import { PerformanceHorizonDialog } from '@/components/PerformanceHorizonDialog';
import { CostOfLivingHorizonDialog } from '@/components/CostOfLivingHorizonDialog';
import { DailyAverageHorizonDialog } from '@/components/DailyAverageHorizonDialog';

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
    <Paper sx={{ p: 2, borderRadius: 3, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: subColor, fontWeight: 600 }}>
        {subLabel}
      </Typography>
    </Paper>
  );
}

function MovementRow({
  kind,
  label,
  total,
  currency,
  language,
}: {
  kind: number;
  label: string;
  total: number;
  currency?: Currency;
  language?: Language;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
      <Avatar sx={{ bgcolor: EntryKindColors[kind as 0 | 1 | 2 | 3 | 4], width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
        {EntryKindLetters[kind as 0 | 1 | 2 | 3 | 4]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatCurrency(total, currency, language)}
      </Typography>
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

  return (
    <Box>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, fontWeight: 700 }}>
        {t('dashboard.monthlyCalculations')}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4, mt: 1 }}>
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

      <Paper sx={{ borderRadius: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t('dashboard.monthMovements')}
          </Typography>
          <Button size="small" onClick={() => navigate(`/entries?month=${month}&year=${year}`)}>
            {t('dashboard.seeAll')}
          </Button>
        </Box>

        <MovementRow kind={EntryKind.Entrada} label={t('dashboard.income')} total={movements.entrada} currency={profile?.currency} language={profile?.language} />
        <MovementRow kind={EntryKind.Saida} label={t('dashboard.expenses')} total={movements.saida} currency={profile?.currency} language={profile?.language} />
        <MovementRow kind={EntryKind.Diario} label={t('dashboard.daily')} total={movements.diario} currency={profile?.currency} language={profile?.language} />
        <MovementRow kind={EntryKind.Economia} label={t('dashboard.savings')} total={movements.economia} currency={profile?.currency} language={profile?.language} />
        <MovementRow kind={EntryKind.Cartao} label={t('dashboard.cardSpending')} total={movements.cartao} currency={profile?.currency} language={profile?.language} />
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
