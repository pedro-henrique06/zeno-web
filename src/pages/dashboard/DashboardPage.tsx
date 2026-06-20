import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAllEntries } from '@/hooks/useEntries';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';
import type { Entry } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { getEntryKind, EntryKindColors, EntryKindLetters, type EntryKind } from '@/utils/entryKind';

interface KindBucket {
  kind: EntryKind;
  total: number;
  count: number;
}

function bucketByKind(entries: Entry[]) {
  const map = new Map<EntryKind, KindBucket>();
  for (const entry of entries) {
    const kind = getEntryKind(entry);
    const bucket = map.get(kind) ?? { kind, total: 0, count: 0 };
    bucket.total += entry.value;
    bucket.count += 1;
    map.set(kind, bucket);
  }
  return map;
}

function StatCard({
  label,
  value,
  subLabel,
  subColor,
}: {
  label: string;
  value: string;
  subLabel: string;
  subColor: 'success.main' | 'error.main' | 'text.secondary';
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
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
  bucket,
}: {
  kind: EntryKind;
  label: string;
  bucket?: KindBucket;
}) {
  const total = bucket?.total ?? 0;
  const count = bucket?.count ?? 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
      <Avatar sx={{ bgcolor: EntryKindColors[kind], width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
        {EntryKindLetters[kind]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {count}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatCurrency(total)}
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data: entries, isLoading } = useAllEntries(month, year);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const list = entries ?? [];
  const buckets = bucketByKind(list);

  const income = buckets.get('entrada')?.total ?? 0;
  const fixedCost = buckets.get('saida')?.total ?? 0;
  const daily = buckets.get('diario')?.total ?? 0;
  const savings = buckets.get('economia')?.total ?? 0;
  const card = buckets.get('cartao')?.total ?? 0;

  const performance = income - fixedCost - daily - savings - card;
  const costOfLiving = fixedCost + daily;

  const daysElapsed = Math.min(now.getDate(), new Date(year, month, 0).getDate());
  const dailyAverage = daysElapsed > 0 ? daily / daysElapsed : 0;

  return (
    <Box>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} locale={locale} />

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <StatCard
          label={t.totals.performance}
          value={formatCurrency(performance)}
          subLabel={performance >= 0 ? t.totals.moneyLeftOver : t.totals.missingMoney}
          subColor={performance >= 0 ? 'success.main' : 'error.main'}
        />
        <StatCard
          label={t.totals.economized}
          value={formatCurrency(savings)}
          subLabel={savings > 0 ? t.totals.savingsLabel : t.totals.nothingSaved}
          subColor={savings > 0 ? 'success.main' : 'text.secondary'}
        />
        <StatCard
          label={t.totals.costOfLiving}
          value={formatCurrency(costOfLiving)}
          subLabel={costOfLiving > income ? t.totals.aboveIncome : t.totals.withinIncome}
          subColor={costOfLiving > income ? 'error.main' : 'success.main'}
        />
        <StatCard
          label={t.totals.dailyAverage}
          value={formatCurrency(dailyAverage)}
          subLabel={t.totals.dailyLabel}
          subColor="text.secondary"
        />
      </Box>

      <Paper sx={{ borderRadius: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {t.totals.monthMovements}
          </Typography>
          <Button size="small" onClick={() => navigate('/entries')}>
            {t.totals.viewAll}
          </Button>
        </Box>

        <MovementRow kind="entrada" label={t.totals.incomeLabel} bucket={buckets.get('entrada')} />
        <MovementRow kind="saida" label={t.totals.outcomeLabel} bucket={buckets.get('saida')} />
        <MovementRow kind="diario" label={t.totals.dailyLabel} bucket={buckets.get('diario')} />
        <MovementRow kind="economia" label={t.totals.savingsLabel} bucket={buckets.get('economia')} />
        <MovementRow kind="cartao" label={t.totals.cardLabel} bucket={buckets.get('cartao')} />
      </Paper>
    </Box>
  );
}
