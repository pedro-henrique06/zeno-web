import { useState, useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Slider,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile } from '@/hooks/useUser';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import { formatMonths, futureValue, irRate, monthsToGoal } from '@/utils/goalMath';
import { useGoal, useSaveGoal, useDeleteGoal } from '@/hooks/useGoal';
import { alpha } from '@mui/material/styles';
import { brand } from '@/theme/tokens';

// ─── Scenario bar chart ───────────────────────────────────────────────────────

const SCENARIO_MULTIPLIERS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

function color(months: number): string {
  const years = months / 12;
  if (years > 15) return brand.expense;
  if (years > 7) return brand.warning;
  return brand.income;
}

interface ScenarioBarsProps {
  basePmt: number;
  initial: number;
  target: number;
  rate: number;
  currency: string;
  locale: string;
}

function ScenarioBars({ basePmt, initial, target, rate, currency, locale }: ScenarioBarsProps) {
  const scenarios = useMemo(() => {
    return SCENARIO_MULTIPLIERS.map((m) => {
      const pmt = basePmt * m;
      const months = monthsToGoal(target, pmt, rate, initial);
      return { pmt, months };
    });
  }, [basePmt, initial, target, rate]);

  const maxMonths = scenarios
    .map((s) => s.months)
    .filter(isFinite)
    .reduce((a, b) => Math.max(a, b), 1);

  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(v);

  return (
    <Box sx={{ mt: 1 }}>
      {scenarios.map(({ pmt, months }, i) => {
        const widthPct = isFinite(months) ? Math.min((months / maxMonths) * 100, 100) : 100;
        const barColor = color(months);
        const isBase = SCENARIO_MULTIPLIERS[i] === 1;
        return (
          <Box
            key={i}
            role="img"
            aria-label={`${fmtCurrency(pmt)}: ${formatMonths(months)}`}
            title={`${fmtCurrency(pmt)}: ${formatMonths(months)}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: '64px 1fr 56px',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: isBase ? 700 : 500,
                color: isBase ? 'text.primary' : 'text.secondary',
                textAlign: 'right',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {fmtCurrency(pmt)}
            </Typography>

            <Box sx={{ position: 'relative', height: 18 }}>
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '100%',
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'action.hover',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: `${widthPct}%`,
                  height: isBase ? 10 : 8,
                  borderRadius: 4,
                  bgcolor: barColor,
                  transition: 'width 0.4s ease',
                  boxShadow: isBase ? `0 0 8px ${barColor}66` : 'none',
                }}
              />
            </Box>

            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: isBase ? 700 : 400,
                color: isBase ? barColor : 'text.secondary',
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {formatMonths(months)}
            </Typography>
          </Box>
        );
      })}
      {/* X-axis labels */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '64px 1fr 56px',
          gap: 1,
          mt: 0.5,
        }}
      >
        <Box />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {['0', '5a', '10a', '15a', '20a', '25a'].map((l) => (
            <Typography key={l} sx={{ fontSize: '11px', color: 'text.secondary' }}>
              {l}
            </Typography>
          ))}
        </Box>
        <Box />
      </Box>
    </Box>
  );
}

// ─── Stat tile ────────────────────────────────────────────────────────────────

function StatTile({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        p: 1.5,
        borderRadius: 2,
        bgcolor: highlight ? alpha(brand.income, 0.08) : 'action.hover',
        border: highlight ? `1px solid ${alpha(brand.income, 0.2)}` : '1px solid transparent',
      }}
    >
      <Typography
        sx={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '13px',
          fontWeight: 700,
          fontVariantNumeric: 'tabular-nums',
          color: highlight ? brand.income : 'text.primary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function GoalsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? 'BRL';
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];
  const symbol = CURRENCY_SYMBOLS[currency];

  // Inputs
  const [targetRaw, setTargetRaw] = useState('1000000');
  const [pmtRaw, setPmtRaw] = useState('500');
  const [rate, setRate] = useState(14.55); // 103% CDI default
  const [nameRaw, setNameRaw] = useState('');
  const [initialRaw, setInitialRaw] = useState('0');
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

  const { data: goal } = useGoal();
  const saveGoal = useSaveGoal();
  const deleteGoal = useDeleteGoal();

  // Fill the form once from the saved goal (setting state while rendering is the supported pattern here).
  const [hydrated, setHydrated] = useState(false);
  if (goal && !hydrated) {
    setHydrated(true);
    setNameRaw(goal.name);
    setTargetRaw(String(Math.round(goal.targetAmount)));
    setPmtRaw(String(Math.round(goal.monthlyContribution)));
    setInitialRaw(String(Math.round(goal.initialAmount)));
    setRate(goal.annualRatePercent);
  }

  const target = parseFloat(targetRaw.replace(/\D/g, '')) || 0;
  const pmt = parseFloat(pmtRaw.replace(/\D/g, '')) || 0;
  const initial = parseFloat(initialRaw.replace(/\D/g, '')) || 0;

  // Results
  const months = useMemo(() => monthsToGoal(target, pmt, rate, initial), [target, pmt, rate, initial]);
  const invested = initial + pmt * months;
  const fv = futureValue(pmt, months, rate, initial);
  const grossEarnings = fv - invested;
  const ir = isFinite(months) ? grossEarnings * irRate(months) : 0;
  const netEarnings = grossEarnings - ir;
  const netFv = invested + netEarnings;

  const fmtCurrency = (v: number) =>
    isFinite(v)
      ? new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          maximumFractionDigits: 0,
        }).format(v)
      : '—';

  const handleTargetChange = (v: string) => {
    const digits = v.replace(/\D/g, '');
    setTargetRaw(digits);
  };

  const handlePmtChange = (v: string) => {
    const digits = v.replace(/\D/g, '');
    setPmtRaw(digits);
  };

  const displayTarget = target > 0
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(target)
    : '';

  const displayInitial = initial > 0
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(initial)
    : '';

  const canSave = target > 0 && pmt > 0 && nameRaw.trim().length > 0;

  const handleSave = () => {
    saveGoal.mutate(
      {
        name: nameRaw.trim(),
        targetAmount: target,
        monthlyContribution: pmt,
        initialAmount: initial,
        annualRatePercent: Math.round(rate * 100) / 100,
      },
      {
        onSuccess: () => setToast({ message: t('goals.saved'), severity: 'success' }),
        onError: () => setToast({ message: t('goals.saveError'), severity: 'error' }),
      },
    );
  };

  const handleRemove = () => {
    deleteGoal.mutate(undefined, {
      onSuccess: () => {
        setNameRaw('');
        setHydrated(false);
        setToast({ message: t('goals.removed'), severity: 'success' });
      },
      onError: () => setToast({ message: t('goals.saveError'), severity: 'error' }),
    });
  };

  const displayPmt = pmt > 0
    ? new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(pmt)
    : '';

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Simulador de Metas
        </Typography>
      </Box>

      {/* Reference rate card */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 3,
          mb: 2,
          bgcolor: brand.navy,
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>
              Taxa de juros (a.a.)
            </Typography>
            <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '1.5rem', fontWeight: 600, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
              {rate.toFixed(2)}%
            </Typography>
          </Box>
          <TrendingUpIcon sx={{ color: brand.blue, opacity: 0.7, mt: 0.5 }} />
        </Box>
        <Slider
          value={rate}
          min={2}
          max={25}
          step={0.05}
          onChange={(_, v) => setRate(v as number)}
          sx={{
            color: brand.blue,
            '& .MuiSlider-thumb': { width: 16, height: 16 },
            '& .MuiSlider-track': { height: 4 },
            '& .MuiSlider-rail': { height: 4, opacity: 0.3 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>2%</Typography>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)' }}>Sugestão: Selic/CDI (~14%)</Typography>
          <Typography sx={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>25%</Typography>
        </Box>
      </Paper>

      {/* Inputs */}
      <Paper sx={{ borderRadius: 3, mb: 2, p: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
          Parâmetros
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Valor da meta"
            value={displayTarget}
            onChange={(e) => handleTargetChange(e.target.value)}
            placeholder="1.000.000"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
              },
            }}
          />
          <TextField
            label="Aporte mensal"
            value={displayPmt}
            onChange={(e) => handlePmtChange(e.target.value)}
            placeholder="500"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
              },
            }}
          />
          <TextField
            label={t('goals.initialLabel')}
            value={displayInitial}
            onChange={(e) => setInitialRaw(e.target.value.replace(/\D/g, ''))}
            placeholder="0"
            fullWidth
            size="small"
            slotProps={{
              input: {
                startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
              },
            }}
          />
          <TextField
            label={t('goals.nameLabel')}
            value={nameRaw}
            onChange={(e) => setNameRaw(e.target.value)}
            placeholder={t('goals.namePlaceholder')}
            fullWidth
            size="small"
            slotProps={{ htmlInput: { maxLength: 60 } }}
          />
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              fullWidth
              disabled={!canSave || saveGoal.isPending}
              onClick={handleSave}
            >
              {goal ? t('goals.update') : t('goals.save')}
            </Button>
            {goal && (
              <Button color="error" disabled={deleteGoal.isPending} onClick={handleRemove}>
                {t('goals.remove')}
              </Button>
            )}
          </Box>
        </Box>
      </Paper>

      <Snackbar
        open={!!toast}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity={toast?.severity ?? 'success'} variant="filled" onClose={() => setToast(null)} sx={{ width: '100%' }}>
          {toast?.message}
        </Alert>
      </Snackbar>

      {/* Results */}
      {pmt > 0 && target > 0 && (
        <>
          <Paper sx={{ borderRadius: 3, mb: 2, p: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'text.secondary', mb: 1.5 }}>
              Resultado
            </Typography>

            {/* Time highlight */}
            <Box
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: brand.navy,
                mb: 1.5,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>
                Tempo necessário
              </Typography>
              <Typography sx={{ fontFamily: '"Fraunces", serif', fontSize: '2.25rem', fontWeight: 600, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
                {formatMonths(months)}
              </Typography>
            </Box>

            {/* Stat tiles */}
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <StatTile label="Total investido" value={fmtCurrency(invested)} />
              <StatTile label="Rendimento bruto" value={fmtCurrency(grossEarnings)} highlight />
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <StatTile label={`IR (~${(irRate(months) * 100).toFixed(1)}%)`} value={`−${fmtCurrency(ir)}`} />
              <StatTile label="Valor líquido final" value={fmtCurrency(netFv)} highlight />
            </Box>
          </Paper>

          {/* Scenarios chart */}
          <Paper sx={{ borderRadius: 3, mb: 3, p: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
              Cenários de aporte
            </Typography>
            <Typography sx={{ fontSize: '12px', color: 'text.secondary', mb: 1.5 }}>
              Quanto tempo leva para atingir {fmtCurrency(target)} variando o aporte
            </Typography>
            <ScenarioBars
              basePmt={pmt}
              initial={initial}
              target={target}
              rate={rate}
              currency={currency}
              locale={locale}
            />
          </Paper>
        </>
      )}

      {/* Empty state */}
      {(pmt === 0 || target === 0) && (
        <Paper sx={{ borderRadius: 3, p: 3, textAlign: 'center', boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <TrendingUpIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary" sx={{ fontSize: '14px' }}>
            Preencha o valor da meta e o aporte mensal para ver a simulação
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
