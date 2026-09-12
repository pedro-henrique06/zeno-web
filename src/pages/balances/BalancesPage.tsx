import { useEffect, useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import {
  Box,
  CircularProgress,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Avatar,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import InsightsIcon from '@mui/icons-material/Insights';
import AppsIcon from '@mui/icons-material/Apps';
import { useTranslation } from 'react-i18next';
import { useBalances } from '@/hooks/useBalances';
import { useEntries } from '@/hooks/useEntries';
import { useIsMobile } from '@/hooks/useIsMobile';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { StickyHeader } from '@/components/layout/StickyHeader';
import { EntryKind } from '@/types';
import type { BalanceDay, Currency, Language, Entry } from '@/types';
import { EntryKindColors, EntryKindLetters, useEntryKindLabels, isCredit } from '@/utils/entryKind';
import { getBalanceColor, getBalanceTone } from '@/utils/balanceColor';
import { BalancesHorizonDialog } from '@/components/BalancesHorizonDialog';
import { BalanceChart } from '@/components/BalanceChart';

const KINDS = [EntryKind.Diario, EntryKind.Entrada, EntryKind.Saida, EntryKind.Economia, EntryKind.Cartao];
const ALL_COLOR = '#4A9FE0';
const SWIPE_THRESHOLD = 60;
type KindFilter = EntryKind | 'all';

const KIND_FIELD: Record<EntryKind, keyof BalanceDay> = {
  [EntryKind.Entrada]: 'entrada',
  [EntryKind.Saida]: 'saida',
  [EntryKind.Diario]: 'diario',
  [EntryKind.Economia]: 'economia',
  [EntryKind.Cartao]: 'cartao',
};

const KIND_ICONS: Partial<Record<EntryKind, typeof CallReceivedIcon>> = {
  [EntryKind.Entrada]: CallReceivedIcon,
  [EntryKind.Saida]: CallMadeIcon,
};

function KindAvatar({ kind, size }: { kind: EntryKind; size: number }) {
  const Icon = KIND_ICONS[kind];
  return (
    <Avatar sx={{ bgcolor: EntryKindColors[kind], width: size, height: size, fontSize: size * 0.55, fontWeight: 700 }}>
      {Icon ? <Icon sx={{ fontSize: size * 0.6 }} /> : EntryKindLetters[kind]}
    </Avatar>
  );
}

function AllAvatar({ size }: { size: number }) {
  return (
    <Avatar sx={{ bgcolor: ALL_COLOR, width: size, height: size }}>
      <AppsIcon sx={{ fontSize: size * 0.6 }} />
    </Avatar>
  );
}

function DayCell({ day }: { day: BalanceDay }) {
  return day.isToday ? (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        borderRadius: '50%',
        bgcolor: '#4A9FE0',
        color: '#fff',
        fontWeight: 700,
        fontSize: 13,
      }}
    >
      {day.day}
    </Box>
  ) : (
    day.day
  );
}

function BalanceCell({ day, currency, language }: { day: BalanceDay; currency?: Currency; language?: Language }) {
  return (
    <Typography
      variant="body2"
      sx={{ fontWeight: 700, color: getBalanceColor(day.balance), fontVariantNumeric: 'tabular-nums' }}
    >
      {formatCurrency(day.balance, currency, language)}
    </Typography>
  );
}

function dayRowSx(day: BalanceDay) {
  return day.isToday
    ? { bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.07) }
    : day.isProjected
      ? { opacity: 0.65 }
      : {};
}

function StatsRow({
  days,
  currency,
  language,
}: {
  days: BalanceDay[];
  currency?: Currency;
  language?: Language;
}) {
  const { t } = useTranslation();
  const totalEntradas = days.reduce((s, d) => s + d.entrada, 0);
  const totalSaidas = days.reduce((s, d) => s + d.saida + d.cartao + d.diario, 0);
  const lastBalance = days.length ? days[days.length - 1].balance : 0;

  const stats = [
    { label: t('balances.statsIncome'), value: totalEntradas, color: '#2DC579' },
    { label: t('balances.statsExpenses'), value: totalSaidas, color: '#E86B52' },
    { label: t('balances.statsForecast'), value: lastBalance, color: lastBalance >= 0 ? '#5ECCC8' : '#E86B52' },
  ];

  return (
    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      {stats.map((s) => (
        <Box
          key={s.label}
          sx={{
            flex: 1,
            px: 1.25,
            py: 1.5,
            borderRadius: 2.5,
            bgcolor: '#1B2D48',
          }}
        >
          <Typography
            sx={{
              display: 'block',
              mb: 0.75,
              fontSize: '9px',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '.7px',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {s.label}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Fraunces", serif',
              fontWeight: 700,
              fontSize: '0.85rem',
              color: s.color,
              fontVariantNumeric: 'tabular-nums',
              lineHeight: 1.2,
            }}
          >
            {formatCurrency(s.value, currency, language)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function BalanceHeader({
  days,
  currency,
  language,
}: {
  days: BalanceDay[];
  currency?: Currency;
  language?: Language;
}) {
  const { t } = useTranslation();

  const todayDay = days.find((d) => d.isToday);
  const lastPastDay = [...days].reverse().find((d) => !d.isProjected);
  const currentBalance = (todayDay ?? lastPastDay ?? days[0])?.balance ?? 0;

  const formatted = formatCurrency(Math.abs(currentBalance), currency, language);
  const isNegative = currentBalance < 0;

  const parts = formatted.split(',');
  const intPart = parts[0] ?? formatted;
  const decPart = parts[1];

  return (
    <Box sx={{ pb: 1 }}>
      <Typography sx={{ fontSize: '9px', fontWeight: 800, letterSpacing: '1.2px', textTransform: 'uppercase', color: 'text.secondary', mb: 0.5 }}>
        {t('balances.currentBalance')}
      </Typography>
      <Typography
        sx={{
          fontFamily: '"Fraunces", serif',
          fontSize: '2.4rem',
          fontWeight: 700,
          letterSpacing: '-2px',
          lineHeight: 1,
          color: isNegative ? 'rgba(232,107,82,0.35)' : 'rgba(0,0,0,0.13)',
          fontVariantNumeric: 'tabular-nums',
          mb: 0.75,
        }}
      >
        {isNegative ? '−' : ''}
        {intPart}
        {decPart && (
          <span style={{ fontSize: '1.4rem', opacity: 0.7 }}>,{decPart}</span>
        )}
      </Typography>
    </Box>
  );
}

function UpcomingDot({ kind }: { kind: EntryKind }) {
  const color = EntryKindColors[kind];
  return (
    <Box
      sx={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        border: `2px solid ${color}`,
      }}
    />
  );
}

function UpcomingEntries({
  entries,
  currency,
  language,
}: {
  entries: Entry[];
  currency?: Currency;
  language?: Language;
}) {
  const { t } = useTranslation();
  const today = dayjs().startOf('day');
  const upcoming = entries
    .filter((e) => dayjs(e.date).startOf('day').isAfter(today))
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .slice(0, 5);

  if (upcoming.length === 0) return null;

  return (
    <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', mb: 1.5, overflow: 'hidden' }}>
      <Typography sx={{ px: 2, pt: 1.5, pb: 0.5, fontSize: '10px', fontWeight: 700, letterSpacing: '.7px', textTransform: 'uppercase', color: 'text.disabled' }}>
        {t('balances.upcoming')}
      </Typography>
      {upcoming.map((entry, i) => {
        const credit = isCredit(entry.kind);
        const diff = dayjs(entry.date).startOf('day').diff(today, 'day');
        const dayLabel = dayjs(entry.date).format('DD MMM').toLowerCase();
        return (
          <Box
            key={entry.id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              px: 2,
              py: 1.25,
              borderTop: i > 0 ? '1px solid' : 'none',
              borderColor: 'divider',
            }}
          >
            <UpcomingDot kind={entry.kind} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 500, fontSize: '0.84rem', color: 'text.primary' }} noWrap>
                {entry.title}
              </Typography>
              <Typography sx={{ fontSize: '11px', color: 'text.disabled', mt: '1px' }}>
                em {diff} dia{diff !== 1 ? 's' : ''} · {dayLabel}
              </Typography>
            </Box>
            <Typography
              sx={{ fontWeight: 700, fontSize: '0.84rem', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
              color={credit ? 'success.main' : 'error.main'}
            >
              {credit ? '+' : '−'}{formatCurrency(entry.value, currency, language)}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}

export default function BalancesPage() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const kindLabels = useEntryKindLabels();
  const isMobile = useIsMobile();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [kind, setKind] = useState<KindFilter>(EntryKind.Diario);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [horizonOpen, setHorizonOpen] = useState(false);
  const navigate = useNavigate();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const todayRowRef = useRef<HTMLTableRowElement | null>(null);
  const hasScrolledToTodayRef = useRef(false);

  const { data, isLoading, isError } = useBalances(month, year);
  const { data: entriesData } = useEntries(month, year);

  useEffect(() => {
    if (hasScrolledToTodayRef.current) return;
    if (!todayRowRef.current) return;
    todayRowRef.current.scrollIntoView({ block: 'center' });
    hasScrolledToTodayRef.current = true;
  }, [data]);

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    setMonth(next.getMonth() + 1);
    setYear(next.getFullYear());
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 1) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    touchStartRef.current = null;
    if (!start) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      shiftMonth(deltaX < 0 ? 1 : -1);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress sx={{ color: '#4A9FE0' }} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{t('balances.loadError')}</Typography>
      </Box>
    );
  }

  const days = data?.days ?? [];
  const entries = entriesData?.items ?? [];

  const dayDateString = (day: BalanceDay) => dayjs(new Date(year, month - 1, day.day)).format('YYYY-MM-DD');

  const goToEntriesForDay = (day: BalanceDay) => {
    navigate(`/entries?month=${month}&year=${year}&date=${dayDateString(day)}`);
  };

  return (
    <Box>
      <StickyHeader>
        <MonthSwitcher
          month={month}
          year={year}
          onChange={(m, y) => {
            setMonth(m);
            setYear(y);
          }}
          endAdornment={
            <IconButton size="small" onClick={() => setHorizonOpen(true)} title={t('balances.horizonTooltip')}>
              <InsightsIcon fontSize="small" />
            </IconButton>
          }
        />
      </StickyHeader>

      {days.length > 0 && (
        <BalanceHeader days={days} currency={profile?.currency} language={profile?.language} />
      )}

      {days.length > 1 && (
        <Paper
          sx={{
            borderRadius: 3,
            mb: 1.5,
            overflow: 'hidden',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 'none',
            px: 0.5,
            pt: 0.5,
            pb: 0,
          }}
        >
          <BalanceChart days={days} height={100} />
        </Paper>
      )}

      {days.length > 0 && (
        <StatsRow days={days} currency={profile?.currency} language={profile?.language} />
      )}

      {entries.length > 0 && (
        <UpcomingEntries entries={entries} currency={profile?.currency} language={profile?.language} />
      )}

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('balances.day')}</TableCell>
              {isMobile ? (
                <TableCell align="right">
                  <Box
                    onClick={(e: MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      cursor: 'pointer',
                      px: 1,
                      py: 0.25,
                      borderRadius: 999,
                      bgcolor: 'action.hover',
                    }}
                  >
                    {kind === 'all' ? <AllAvatar size={20} /> : <KindAvatar kind={kind} size={20} />}
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {kind === 'all' ? t('balances.all') : kindLabels[kind]}
                    </Typography>
                    <KeyboardArrowDownIcon fontSize="small" />
                  </Box>
                  <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                    <MenuItem
                      selected={kind === 'all'}
                      onClick={() => {
                        setKind('all');
                        setAnchorEl(null);
                      }}
                    >
                      <ListItemIcon>
                        <AllAvatar size={24} />
                      </ListItemIcon>
                      <ListItemText>{t('balances.all')}</ListItemText>
                    </MenuItem>
                    {KINDS.map((k) => (
                      <MenuItem
                        key={k}
                        selected={k === kind}
                        onClick={() => {
                          setKind(k);
                          setAnchorEl(null);
                        }}
                      >
                        <ListItemIcon>
                          <KindAvatar kind={k} size={24} />
                        </ListItemIcon>
                        <ListItemText>{kindLabels[k]}</ListItemText>
                      </MenuItem>
                    ))}
                  </Menu>
                </TableCell>
              ) : (
                KINDS.map((k) => (
                  <TableCell key={k} align="right">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
                      <KindAvatar kind={k} size={20} />
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {kindLabels[k]}
                      </Typography>
                    </Box>
                  </TableCell>
                ))
              )}
              <TableCell align="right">{t('balances.balances')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isMobile
              ? days.map((day) => {
                  const rowSx = dayRowSx(day);
                  return (
                    <TableRow key={day.day} sx={rowSx} ref={day.isToday ? todayRowRef : undefined}>
                      <TableCell sx={{ cursor: 'pointer' }} onClick={() => goToEntriesForDay(day)}>
                        <DayCell day={day} />
                      </TableCell>
                      {KINDS.map((k) => {
                        const value = day[KIND_FIELD[k]] as number;
                        const hasValue = value > 0;
                        return (
                          <TableCell key={k} align="right">
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: hasValue ? EntryKindColors[k] : 'text.disabled',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatCurrency(value, profile?.currency, profile?.language)}
                            </Typography>
                          </TableCell>
                        );
                      })}
                      <TableCell
                        align="right"
                        sx={{ bgcolor: (theme: Theme) => alpha(theme.palette[getBalanceTone(day.balance)].main, 0.1) }}
                      >
                        <BalanceCell day={day} currency={profile?.currency} language={profile?.language} />
                      </TableCell>
                    </TableRow>
                  );
                })
              : kind === 'all'
              ? days.flatMap((day) => {
                  const rowSx = dayRowSx(day);
                  return KINDS.map((k, idx) => {
                    const value = day[KIND_FIELD[k]] as number;
                    const hasValue = value > 0;
                    return (
                      <TableRow
                        key={`${day.day}-${k}`}
                        sx={rowSx}
                        ref={idx === 0 && day.isToday ? todayRowRef : undefined}
                      >
                        {idx === 0 && (
                          <TableCell
                            rowSpan={KINDS.length}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => goToEntriesForDay(day)}
                          >
                            <DayCell day={day} />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <KindAvatar kind={k} size={20} />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 700,
                                color: hasValue ? EntryKindColors[k] : 'text.disabled',
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {formatCurrency(value, profile?.currency, profile?.language)}
                            </Typography>
                          </Box>
                        </TableCell>
                        {idx === 0 && (
                          <TableCell
                            align="right"
                            rowSpan={KINDS.length}
                            sx={{ bgcolor: (theme: Theme) => alpha(theme.palette[getBalanceTone(day.balance)].main, 0.1) }}
                          >
                            <BalanceCell day={day} currency={profile?.currency} language={profile?.language} />
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  });
                })
              : days.map((day) => {
                  const rowSx = dayRowSx(day);
                  const value = day[KIND_FIELD[kind]] as number;
                  const hasValue = value > 0;
                  return (
                    <TableRow key={day.day} sx={rowSx} ref={day.isToday ? todayRowRef : undefined}>
                      <TableCell sx={{ cursor: 'pointer' }} onClick={() => goToEntriesForDay(day)}>
                        <DayCell day={day} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <KindAvatar kind={kind} size={20} />
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 700,
                              color: hasValue ? EntryKindColors[kind] : 'text.disabled',
                              fontVariantNumeric: 'tabular-nums',
                            }}
                          >
                            {formatCurrency(value, profile?.currency, profile?.language)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <BalanceCell day={day} currency={profile?.currency} language={profile?.language} />
                      </TableCell>
                    </TableRow>
                  );
                })}
          </TableBody>
        </Table>
      </TableContainer>

      <BalancesHorizonDialog key={year} open={horizonOpen} onClose={() => setHorizonOpen(false)} initialYear={year} />
    </Box>
  );
}
