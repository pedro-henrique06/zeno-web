import { useState } from 'react';
import { Alert, Box, Button, CircularProgress, IconButton, InputAdornment, TextField, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useDeleteHouseGoal, useHouseBudget, useSaveHouseGoal } from '@/hooks/useHouses';
import { useGoal } from '@/hooks/useGoal';
import { useProfile } from '@/hooks/useUser';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES, formatCurrency } from '@/utils/currency';
import { formatMonths } from '@/utils/goalMath';
import { brand } from '@/theme/tokens';
import type { House } from '@/types';

const SLICES = [
  { key: 'needs', share: 50, color: brand.blue },
  { key: 'wants', share: 30, color: brand.teal },
  { key: 'savings', share: 20, color: brand.income },
] as const;

const LABEL_SX = {
  fontSize: '11px',
  fontWeight: 700,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'text.secondary',
} as const;

/** 50/30/20 over the pooled monthly income of everyone in the house, plus the house goal. */
export function HouseBudgetTab({ house }: { house: House }) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const { data: personalGoal } = useGoal();

  const now = new Date();
  const [period, setPeriod] = useState({ month: now.getMonth() + 1, year: now.getFullYear() });
  const { data: budget, isLoading, isError } = useHouseBudget(house.id, period.month, period.year);

  const saveGoal = useSaveHouseGoal(house.id);
  const deleteGoal = useDeleteHouseGoal(house.id);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [targetRaw, setTargetRaw] = useState('');
  const [goalError, setGoalError] = useState(false);

  const language = profile?.language ?? 'PtBR';
  const locale = LANGUAGE_LOCALES[language];
  const currency = budget?.currency ?? profile?.currency ?? 'BRL';
  const money = (value: number) => formatCurrency(value, currency, language);

  const rawMonthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(
    new Date(period.year, period.month - 1, 1),
  );
  const monthLabel = rawMonthLabel.charAt(0).toUpperCase() + rawMonthLabel.slice(1);
  const shift = (delta: number) => {
    const d = new Date(period.year, period.month - 1 + delta, 1);
    setPeriod({ month: d.getMonth() + 1, year: d.getFullYear() });
  };

  const target = parseInt(targetRaw || '0', 10);
  const displayTarget = target > 0 ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(target) : '';

  const startEditing = () => {
    setName(budget?.goal?.name ?? '');
    setTargetRaw(budget?.goal ? String(Math.round(budget.goal.targetAmount)) : '');
    setGoalError(false);
    setEditing(true);
  };

  const handleSaveGoal = () => {
    setGoalError(false);
    saveGoal.mutate(
      { name: name.trim(), targetAmount: target },
      { onSuccess: () => setEditing(false), onError: () => setGoalError(true) },
    );
  };

  const handleRemoveGoal = () => {
    setGoalError(false);
    deleteGoal.mutate(undefined, { onSuccess: () => setEditing(false), onError: () => setGoalError(true) });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (isError || !budget) {
    return (
      <Box sx={{ px: 3, pt: 2 }}>
        <Alert severity="error">{t('houseBudget.loadError')}</Alert>
      </Box>
    );
  }

  const goal = budget.goal;
  const noIncome = budget.totalIncome <= 0;

  return (
    <Box sx={{ px: 3, pt: 1 }}>
      {/* Month switcher */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1.5 }}>
        <IconButton size="small" aria-label={t('common.previousMonth')} onClick={() => shift(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, minWidth: 140, textAlign: 'center' }}>
          {monthLabel}
        </Typography>
        <IconButton size="small" aria-label={t('common.nextMonth')} onClick={() => shift(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      {/* Pooled income */}
      <Box sx={{ p: 2, borderRadius: 3, bgcolor: brand.navy, color: '#FFFFFF', mb: 1.5 }}>
        <Typography sx={{ ...LABEL_SX, color: 'rgba(255,255,255,0.55)' }}>{t('houseBudget.totalIncome')}</Typography>
        <Typography
          sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.9rem', fontWeight: 600, lineHeight: 1.15, fontVariantNumeric: 'tabular-nums' }}
        >
          {money(budget.totalIncome)}
        </Typography>
        <Typography sx={{ fontSize: '12px', color: 'rgba(255,255,255,0.65)', mt: 0.25 }}>
          {t('houseBudget.residents', { count: budget.residentCount })}
        </Typography>
      </Box>

      {noIncome && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {t('houseBudget.noIncome')}
        </Typography>
      )}

      {/* 50 / 30 / 20 */}
      <Box sx={{ mb: 1.5 }}>
        {SLICES.map(({ key, share, color }) => {
          const amount = budget[key];
          return (
            <Box key={key} sx={{ mb: 1.25 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                  {share}% · {t(`houseBudget.${key}`)}
                </Typography>
                <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color, fontVariantNumeric: 'tabular-nums' }}>
                  {money(amount)}
                </Typography>
              </Box>
              <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'action.hover', mt: 0.5, overflow: 'hidden' }}>
                <Box sx={{ height: '100%', width: `${share}%`, borderRadius: 3, bgcolor: color }} />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* Free amount per resident */}
      <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <Typography sx={LABEL_SX}>{t('houseBudget.freePerPerson')}</Typography>
        <Typography
          sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem', fontWeight: 600, color: brand.teal, fontVariantNumeric: 'tabular-nums' }}
        >
          {money(budget.freePerPerson)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('houseBudget.freeHint', { amount: money(budget.wants), count: budget.residentCount })}
        </Typography>
      </Box>

      {/* House goal */}
      <Typography sx={{ ...LABEL_SX, mb: 0.75 }}>{t('houseBudget.goalTitle')}</Typography>

      {goalError && (
        <Alert severity="error" sx={{ mb: 1.5 }}>
          {t('houseBudget.goalError')}
        </Alert>
      )}

      {editing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2 }}>
          <TextField
            size="small"
            label={t('houseBudget.goalName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 60 } }}
            fullWidth
          />
          <TextField
            size="small"
            label={t('houseBudget.goalTarget')}
            value={displayTarget}
            onChange={(e) => setTargetRaw(e.target.value.replace(/\D/g, ''))}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">{CURRENCY_SYMBOLS[currency]}</InputAdornment> },
            }}
            fullWidth
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={name.trim().length === 0 || target <= 0 || saveGoal.isPending}
              onClick={handleSaveGoal}
            >
              {t('houseBudget.goalSave')}
            </Button>
            <Button onClick={() => setEditing(false)}>{t('common.cancel')}</Button>
          </Box>
        </Box>
      ) : goal ? (
        <Box sx={{ p: 2, borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 1 }}>
            <Typography sx={{ fontWeight: 600, minWidth: 0 }} noWrap>
              {goal.name}
            </Typography>
            <Typography
              sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.15rem', fontWeight: 600, color: brand.income, fontVariantNumeric: 'tabular-nums' }}
            >
              {goal.progressPercent.toFixed(goal.progressPercent % 1 === 0 ? 0 : 1)}%
            </Typography>
          </Box>
          <Box sx={{ height: 8, borderRadius: 4, bgcolor: 'action.hover', overflow: 'hidden', my: 1.25 }}>
            <Box
              sx={{
                height: '100%',
                width: `${goal.progressPercent}%`,
                borderRadius: 4,
                background: `linear-gradient(90deg, ${brand.income}, ${brand.teal})`,
              }}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {t('houseBudget.goalOf', { saved: money(goal.accumulatedAmount), target: money(goal.targetAmount) })}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {goal.monthsRemaining === 0
                ? t('houseBudget.goalReached')
                : goal.monthsRemaining === null
                  ? t('houseBudget.goalNoEstimate')
                  : t('houseBudget.goalRemaining', { time: formatMonths(goal.monthsRemaining) })}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {t('houseBudget.goalMonthly', { amount: money(goal.monthlyContribution) })}
          </Typography>
          {budget.isOwner && (
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button size="small" onClick={startEditing}>
                {t('houseBudget.goalEdit')}
              </Button>
              <Button size="small" color="error" disabled={deleteGoal.isPending} onClick={handleRemoveGoal}>
                {t('houseBudget.goalRemove')}
              </Button>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: budget.isOwner ? 1 : 0 }}>
            {budget.isOwner ? t('houseBudget.goalEmptyOwner') : t('houseBudget.goalEmptyMember')}
          </Typography>
          {budget.isOwner && (
            <Button variant="outlined" onClick={startEditing}>
              {t('houseBudget.goalCreate')}
            </Button>
          )}
        </Box>
      )}

      {/* The viewer's own goal: separate and only visible to them */}
      {personalGoal && (
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover', mb: 2 }}>
          <Typography sx={LABEL_SX}>{t('houseBudget.personalGoal')}</Typography>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {personalGoal.name} · {Math.round(personalGoal.progressPercent)}%
          </Typography>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', pb: 1 }}>
        {t('houseBudget.privacy')}
      </Typography>
    </Box>
  );
}
