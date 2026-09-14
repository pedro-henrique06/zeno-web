import { useState, useMemo } from 'react';
import {
  Box,
  IconButton,
  InputAdornment,
  Paper,
  Slider,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useUser';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';

// ─── Math helpers ────────────────────────────────────────────────────────────

function monthlyRate(annualPct: number): number {
  return Math.pow(1 + annualPct / 100, 1 / 12) - 1;
}

/** Months needed to reach `fv` saving `pmt` per month at `annualPct` % a.a. */
function monthsToGoal(fv: number, pmt: number, annualPct: number): number {
  if (pmt <= 0 || fv <= 0) return Infinity;
  const r = monthlyRate(annualPct);
  if (r === 0) return fv / pmt;
  // n = log(1 + FV*r/PMT) / log(1+r)
  const ratio = 1 + (fv * r) / pmt;
  if (ratio <= 0) return Infinity;
  return Math.log(ratio) / Math.log(1 + r);
}

/** Future value of `pmt` per month for `n` months at `annualPct` % a.a. */
function futureValue(pmt: number, n: number, annualPct: number): number {
  const r = monthlyRate(annualPct);
  if (r === 0) return pmt * n;
  return pmt * ((Math.pow(1 + r, n) - 1) / r);
}

function irRate(months: number): number {
  if (months <= 6) return 0.225;
  if (months <= 12) return 0.2;
  if (months <= 24) return 0.175;
  return 0.15;
}

function formatMonths(n: number): string {
  if (!isFinite(n)) return '—';
  const y = Math.floor(n / 12);
  const m = Math.round(n % 12);
  if (y === 0) return `${m}m`;
  if (m === 0) return `${y}a`;
  return `${y}a ${m}m`;
}

// ─── Scenario bar chart ───────────────────────────────────────────────────────

const SCENARIO_MULTIPLIERS = [0.5, 0.75, 1, 1.5, 2, 3, 4];

function color(months: number): string {
  const years = months / 12;
  if (years > 15) return '#E86B52';
  if (years > 7) return '#F5A623';
  return '#2DC579';
}

interface ScenarioBarsProps {
  basePmt: number;
  target: number;
  rate: number;
  currency: string;
  locale: string;
}

function ScenarioBars({ basePmt, target, rate, currency, locale }: ScenarioBarsProps) {
  const scenarios = useMemo(() => {
    return SCENARIO_MULTIPLIERS.map((m) => {
      const pmt = basePmt * m;
      const months = monthsToGoal(target, pmt, rate);
      return { pmt, months };
    });
  }, [basePmt, target, rate]);

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
            sx={{
              display: 'grid',
              gridTemplateColumns: '52px 1fr 52px',
              alignItems: 'center',
              gap: 1,
              mb: 0.75,
            }}
          >
            <Typography
              sx={{
                fontSize: '11px',
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
                fontSize: '11px',
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
          gridTemplateColumns: '52px 1fr 52px',
          gap: 1,
          mt: 0.5,
        }}
      >
        <Box />
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {['0', '5a', '10a', '15a', '20a', '25a'].map((l) => (
            <Typography key={l} sx={{ fontSize: '9px', color: 'text.disabled' }}>
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
        bgcolor: highlight ? 'rgba(45,197,121,0.08)' : 'action.hover',
        border: highlight ? '1px solid rgba(45,197,121,0.2)' : '1px solid transparent',
      }}
    >
      <Typography
        sx={{
          fontSize: '9px',
          fontWeight: 700,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          color: 'text.disabled',
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
          color: highlight ? '#2DC579' : 'text.primary',
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
  const { data: profile } = useProfile();
  const currency = profile?.currency ?? 'BRL';
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];
  const symbol = CURRENCY_SYMBOLS[currency];

  // Inputs
  const [targetRaw, setTargetRaw] = useState('1000000');
  const [pmtRaw, setPmtRaw] = useState('500');
  const [rate, setRate] = useState(14.55); // 103% CDI default

  const target = parseFloat(targetRaw.replace(/\D/g, '')) || 0;
  const pmt = parseFloat(pmtRaw.replace(/\D/g, '')) || 0;

  // Results
  const months = useMemo(() => monthsToGoal(target, pmt, rate), [target, pmt, rate]);
  const invested = pmt * months;
  const fv = futureValue(pmt, months, rate);
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
          bgcolor: '#1B2D48',
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 1 }}>
          <Box>
            <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>
              Taxa de juros (a.a.)
            </Typography>
            <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
              {rate.toFixed(2)}%
            </Typography>
          </Box>
          <TrendingUpIcon sx={{ color: '#4A9FE0', opacity: 0.7, mt: 0.5 }} />
        </Box>
        <Slider
          value={rate}
          min={2}
          max={25}
          step={0.05}
          onChange={(_, v) => setRate(v as number)}
          sx={{
            color: '#4A9FE0',
            '& .MuiSlider-thumb': { width: 16, height: 16 },
            '& .MuiSlider-track': { height: 4 },
            '& .MuiSlider-rail': { height: 4, opacity: 0.3 },
          }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: -0.5 }}>
          <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>2%</Typography>
          <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.45)' }}>Sugestão: Selic/CDI (~14%)</Typography>
          <Typography sx={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)' }}>25%</Typography>
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
            InputProps={{
              startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
            }}
          />
          <TextField
            label="Aporte mensal"
            value={displayPmt}
            onChange={(e) => handlePmtChange(e.target.value)}
            placeholder="500"
            fullWidth
            size="small"
            InputProps={{
              startAdornment: <InputAdornment position="start">{symbol}</InputAdornment>,
            }}
          />
        </Box>
      </Paper>

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
                bgcolor: '#1B2D48',
                mb: 1.5,
                textAlign: 'center',
              }}
            >
              <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: 0.25 }}>
                Tempo necessário
              </Typography>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#FFFFFF', fontVariantNumeric: 'tabular-nums' }}>
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
            <Typography sx={{ fontSize: '11px', color: 'text.disabled', mb: 1.5 }}>
              Quanto tempo leva para atingir {fmtCurrency(target)} variando o aporte
            </Typography>
            <ScenarioBars
              basePmt={pmt}
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
