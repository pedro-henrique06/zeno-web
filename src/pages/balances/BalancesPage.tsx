import { useRef, useState, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useBalances } from '@/hooks/useBalances';
import { useEntries } from '@/hooks/useEntries';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import type { BalanceDay, Entry } from '@/types';
import { isCredit } from '@/utils/entryKind';
import { BalanceChart } from '@/components/BalanceChart';

const SWIPE_THRESHOLD = 60;

// ─── Ghost balance number ──────────────────────────────────────────────────
function BalanceHeader({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const todayDay = days.find((d) => d.isToday);
  const lastPast = [...days].reverse().find((d) => !d.isProjected);
  const balance = (todayDay ?? lastPast ?? days[0])?.balance ?? 0;
  const isNeg = balance < 0;
  const formatted = formatCurrency(Math.abs(balance), currency, language);
  const [int, dec] = formatted.split(',');

  return (
    <Box sx={{ mb: 1 }}>
      <Typography sx={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
        {t('balances.currentBalance')}
      </Typography>
      <Typography sx={{
        fontFamily: '"Fraunces", serif',
        fontSize: '2.4rem', fontWeight: 700,
        letterSpacing: '-2px', lineHeight: 1,
        color: (theme) => isNeg
          ? 'rgba(232,107,82,0.35)'
          : theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.13)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {isNeg ? '−' : ''}{int}
        {dec && <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>,{dec}</span>}
      </Typography>
    </Box>
  );
}

// ─── 3 dark stats cards ───────────────────────────────────────────────────
function StatsRow({ days, currency, language }: { days: BalanceDay[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const income = days.reduce((s, d) => s + d.entrada, 0);
  const expenses = days.reduce((s, d) => s + d.saida + d.cartao + d.diario, 0);
  const forecast = days.length ? days[days.length - 1].balance : 0;

  const stats = [
    { label: t('balances.statsIncome'), value: income, color: '#2DC579' },
    { label: t('balances.statsExpenses'), value: expenses, color: '#E86B52' },
    { label: t('balances.statsForecast'), value: forecast, color: forecast >= 0 ? '#5ECCC8' : '#E86B52' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
      {stats.map((s) => (
        <Box key={s.label} sx={{ flex: 1, px: 1.25, py: 1.25, borderRadius: 2.5, bgcolor: '#1B2D48' }}>
          <Typography sx={{ display: 'block', mb: 0.5, fontSize: '7px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.8px', color: 'rgba(255,255,255,0.4)' }}>
            {s.label}
          </Typography>
          <Typography sx={{ fontFamily: '"Fraunces", serif', fontWeight: 700, fontSize: '0.82rem', color: s.color, fontVariantNumeric: 'tabular-nums' }}>
            {formatCurrency(s.value, currency, language)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Upcoming entries ─────────────────────────────────────────────────────
function UpcomingEntries({ entries, currency, language }: { entries: Entry[]; currency?: any; language?: any }) {
  const { t } = useTranslation();
  const today = dayjs().startOf('day');
  const upcoming = entries
    .filter((e) => dayjs(e.date).startOf('day').isAfter(today))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 4);

  if (upcoming.length === 0) return null;

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase', color: 'text.primary', mb: 1 }}>
        {t('balances.upcoming')}
      </Typography>
      {upcoming.map((entry, i) => {
        const credit = isCredit(entry.kind);
        const color = credit ? '#2DC579' : '#E86B52';
        const diff = dayjs(entry.date).startOf('day').diff(today, 'day');
        return (
          <Box key={entry.id} sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1,
            py: 0.875,
            borderTop: i > 0 ? '1px solid' : 'none',
            borderColor: 'divider',
          }}>
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, border: `2px solid ${color}`, mt: '3px' }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: 'text.secondary' }} noWrap>{entry.title}</Typography>
              <Typography sx={{ fontSize: '10px', color: 'text.secondary', opacity: 0.6 }}>
                em {diff} dia{diff !== 1 ? 's' : ''} · {dayjs(entry.date).format('DD MMM').toLowerCase()}
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '12px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', color, flexShrink: 0 }}>
              {credit ? '+' : '−'}{formatCurrency(entry.value, currency, language)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Calendar view ────────────────────────────────────────────────────────
const WEEKDAYS = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D'];

function CalendarView({ days, month, year, onDayPress }: {
  days: BalanceDay[];
  month: number;
  year: number;
  entries?: Entry[];
  onDayPress: (day: number) => void;
}) {
  const today = new Date();
  const isCurrentMonth = today.getMonth() + 1 === month && today.getFullYear() === year;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();

  // Map day→has income/expense/projected
  const dayMap = new Map<number, { hasIncome: boolean; hasExpense: boolean; isProjected: boolean }>();
  days.forEach((d) => {
    const income = d.entrada > 0;
    const expense = d.saida + d.cartao + d.diario > 0;
    dayMap.set(d.day, { hasIncome: income, hasExpense: expense, isProjected: d.isProjected });
  });

  const cells: (number | null)[] = Array(firstDow).fill(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);

  return (
    <Box>
      {/* Weekday headers */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', mb: 0.5 }}>
        {WEEKDAYS.map((d, i) => (
          <Typography key={i} sx={{ textAlign: 'center', fontSize: '8.5px', fontWeight: 700, color: 'text.secondary', py: 0.5 }}>{d}</Typography>
        ))}
      </Box>
      {/* Days grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: '2px' }}>
        {cells.map((day, i) => {
          if (!day) return <Box key={i} />;
          const info = dayMap.get(day);
          const isToday = day === todayDay;
          const isFuture = info?.isProjected;
          return (
            <Box
              key={i}
              onClick={() => onDayPress(day)}
              sx={{
                aspectRatio: '1',
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                borderRadius: '8px', cursor: 'pointer', position: 'relative',
                bgcolor: isToday ? '#4A9FE0' : isFuture ? 'rgba(94,204,200,0.12)' : 'transparent',
                '&:hover': { bgcolor: isToday ? '#4A9FE0' : 'action.hover' },
              }}
            >
              <Typography sx={{ fontSize: '10px', fontWeight: isToday ? 700 : 500, color: isToday ? '#fff' : isFuture ? '#5ECCC8' : 'text.primary' }}>
                {day}
              </Typography>
              {info && (info.hasIncome || info.hasExpense) && (
                <Box sx={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '2px' }}>
                  {info.hasIncome && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isFuture ? '#5ECCC8' : '#2DC579' }} />}
                  {info.hasExpense && <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: isFuture ? '#5ECCC8' : '#E86B52' }} />}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {/* Legend */}
      <Box sx={{ display: 'flex', gap: 1.5, mt: 1.5, mb: 1 }}>
        {[{ color: '#2DC579', label: 'Receita' }, { color: '#E86B52', label: 'Despesa' }, { color: '#5ECCC8', label: 'Futuro' }].map(({ color, label }) => (
          <Box key={label} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: color }} />
            <Typography sx={{ fontSize: '9px', color: 'text.secondary' }}>{label}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Lista view (daily list) ───────────────────────────────────────────────
function ListaView({ days, entries, currency, language, onDayPress }: {
  days: BalanceDay[];
  entries: Entry[];
  currency?: any;
  language?: any;
  onDayPress: (day: number) => void;
}) {
  const shown = days.filter((d) => d.entrada + d.saida + d.diario + d.cartao + d.economia > 0 || d.isToday);

  if (shown.length === 0) {
    return (
      <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 3, fontSize: '0.9rem' }}>
        Sem lançamentos neste mês
      </Typography>
    );
  }

  return (
    <Box>
      {shown.map((d, i) => {
        const isToday = d.isToday;
        const totalExpense = d.saida + d.cartao + d.diario;
        const dayEntries = entries.filter((e) => dayjs(e.date).date() === d.day && !d.isProjected);
        return (
          <Box key={d.day} onClick={() => onDayPress(d.day)} sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            py: 1, cursor: 'pointer',
            borderTop: i > 0 ? '1px solid' : 'none',
            borderColor: 'divider',
            opacity: d.isProjected ? 0.6 : 1,
          }}>
            <Box sx={{
              width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
              bgcolor: isToday ? '#4A9FE0' : 'action.hover',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: isToday ? '#fff' : 'text.primary',
              fontWeight: 700, fontSize: '12px',
            }}>
              {d.day}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {dayEntries.slice(0, 2).map((e) => (
                <Typography key={e.id} sx={{ fontSize: '11px', color: 'text.secondary' }} noWrap>{e.title}</Typography>
              ))}
              {dayEntries.length > 2 && (
                <Typography sx={{ fontSize: '10px', color: 'text.disabled' }}>+{dayEntries.length - 2} mais</Typography>
              )}
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              {d.entrada > 0 && (
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#2DC579', fontVariantNumeric: 'tabular-nums' }}>
                  +{formatCurrency(d.entrada, currency, language)}
                </Typography>
              )}
              {totalExpense > 0 && (
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#E86B52', fontVariantNumeric: 'tabular-nums' }}>
                  −{formatCurrency(totalExpense, currency, language)}
                </Typography>
              )}
            </Box>
            <Typography sx={{ fontWeight: 700, fontSize: '11px', fontVariantNumeric: 'tabular-nums', color: d.balance >= 0 ? '#2DC579' : '#E86B52', minWidth: 56, textAlign: 'right' }}>
              {formatCurrency(d.balance, currency, language)}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

// ─── Segment control ──────────────────────────────────────────────────────
function SegmentControl({ value, onChange }: { value: 'lista' | 'calendario'; onChange: (v: 'lista' | 'calendario') => void }) {
  const opts: { key: 'lista' | 'calendario'; label: string }[] = [
    { key: 'lista', label: 'Lista' },
    { key: 'calendario', label: 'Calendário' },
  ];
  const activeColor = value === 'lista' ? '#4A9FE0' : '#5ECCC8';
  return (
    <Box sx={{ bgcolor: '#1B2D48', borderRadius: '12px', display: 'flex', p: '3px', mb: 1.5 }}>
      {opts.map((o) => (
        <Box key={o.key} onClick={() => onChange(o.key)} sx={{
          flex: 1, textAlign: 'center', py: 0.875,
          borderRadius: '10px', cursor: 'pointer',
          bgcolor: value === o.key ? '#243650' : 'transparent',
          transition: 'background 0.15s',
        }}>
          <Typography sx={{
            fontSize: '12px', fontWeight: 600,
            color: value === o.key ? activeColor : 'rgba(255,255,255,0.45)',
          }}>
            {o.label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────
export default function BalancesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [view, setView] = useState<'lista' | 'calendario'>('lista');
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const navigate = useNavigate();

  const { data: profile } = useProfile();
  const { data, isLoading, isError } = useBalances(month, year);
  const { data: entriesData } = useEntries(month, year);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 1) return;
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const dx = e.changedTouches[0].clientX - start.x;
    const dy = e.changedTouches[0].clientY - start.y;
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy) * 1.5) shiftMonth(dx < 0 ? 1 : -1);
  };

  const goToDay = (day: number) => {
    const date = dayjs(new Date(year, month - 1, day)).format('YYYY-MM-DD');
    navigate(`/entries?month=${month}&year=${year}&date=${date}`);
  };

  if (isLoading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <CircularProgress sx={{ color: '#4A9FE0' }} />
    </Box>
  );

  if (isError) return (
    <Box sx={{ textAlign: 'center', mt: 4 }}>
      <Typography color="error">Erro ao carregar saldos</Typography>
    </Box>
  );

  const days = data?.days ?? [];
  const entries = entriesData?.items ?? [];

  return (
    <Box onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
      {/* Month switcher */}
      <MonthSwitcher
        month={month} year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
      />

      {/* Ghost balance + chart + stats */}
      {days.length > 0 && (
        <>
          <BalanceHeader days={days} currency={profile?.currency} language={profile?.language} />
          {days.length > 1 && (
            <Box sx={{ mb: 1.5 }}>
              <BalanceChart days={days} height={80} />
            </Box>
          )}
          <StatsRow days={days} currency={profile?.currency} language={profile?.language} />
        </>
      )}

      {/* Upcoming entries */}
      {entries.length > 0 && (
        <UpcomingEntries entries={entries} currency={profile?.currency} language={profile?.language} />
      )}

      {/* Segment + view */}
      <SegmentControl value={view} onChange={setView} />

      {view === 'calendario' ? (
        <CalendarView
          days={days} month={month} year={year}
          entries={entries} onDayPress={goToDay}
        />
      ) : (
        <ListaView
          days={days} entries={entries}
          currency={profile?.currency} language={profile?.language}
          onDayPress={goToDay}
        />
      )}
    </Box>
  );
}
