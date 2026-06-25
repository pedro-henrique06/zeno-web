import { useRef, useState, type MouseEvent, type TouchEvent } from 'react';
import dayjs from 'dayjs';
import {
  Avatar,
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
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CallReceivedIcon from '@mui/icons-material/CallReceived';
import CallMadeIcon from '@mui/icons-material/CallMade';
import InsightsIcon from '@mui/icons-material/Insights';
import AppsIcon from '@mui/icons-material/Apps';
import { useTranslation } from 'react-i18next';
import { useBalances } from '@/hooks/useBalances';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency } from '@/utils/currency';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { StickyHeader } from '@/components/layout/StickyHeader';
import { EntryKind } from '@/types';
import type { BalanceDay, Currency, Language } from '@/types';
import { EntryKindColors, EntryKindLetters, useEntryKindLabels } from '@/utils/entryKind';
import { getBalanceColor, getBalanceTone } from '@/utils/balanceColor';
import { BalancesHorizonDialog } from '@/components/BalancesHorizonDialog';
import { EntryFormDialog } from '@/components/EntryFormDialog';

const KINDS = [EntryKind.Diario, EntryKind.Entrada, EntryKind.Saida, EntryKind.Economia, EntryKind.Cartao];
const ALL_COLOR = '#3B82F6';
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
        width: 24,
        height: 24,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        color: 'primary.contrastText',
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
    <Typography variant="body2" sx={{ fontWeight: 700, color: getBalanceColor(day.balance) }}>
      {formatCurrency(day.balance, currency, language)}
    </Typography>
  );
}

function dayRowSx(day: BalanceDay) {
  return day.isToday
    ? { bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.12) }
    : day.isProjected
      ? { opacity: 0.6 }
      : {};
}

export default function BalancesPage() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const kindLabels = useEntryKindLabels();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [kind, setKind] = useState<KindFilter>(EntryKind.Diario);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [horizonOpen, setHorizonOpen] = useState(false);
  const [entryDate, setEntryDate] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const { data, isLoading, isError } = useBalances(month, year);

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
        <CircularProgress />
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

  const dayDateString = (day: BalanceDay) => dayjs(new Date(year, month - 1, day.day)).format('YYYY-MM-DD');

  return (
    <Box>
      <StickyHeader>
        <MonthSwitcher
          month={month}
          year={year}
          onChange={(m, y) => { setMonth(m); setYear(y); }}
          endAdornment={
            <IconButton size="small" onClick={() => setHorizonOpen(true)} title={t('balances.horizonTooltip')}>
              <InsightsIcon fontSize="small" />
            </IconButton>
          }
        />
      </StickyHeader>

      <TableContainer
        component={Paper}
        sx={{ borderRadius: 3 }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t('balances.day')}</TableCell>
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
              <TableCell align="right">{t('balances.balances')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {kind === 'all'
              ? days.flatMap((day) => {
                  const rowSx = dayRowSx(day);
                  return KINDS.map((k, idx) => {
                    const value = day[KIND_FIELD[k]] as number;
                    const hasValue = value > 0;
                    return (
                      <TableRow key={`${day.day}-${k}`} sx={rowSx}>
                        {idx === 0 && (
                          <TableCell
                            rowSpan={KINDS.length}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => setEntryDate(dayDateString(day))}
                          >
                            <DayCell day={day} />
                          </TableCell>
                        )}
                        <TableCell align="right">
                          <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                            <KindAvatar kind={k} size={20} />
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 700, color: hasValue ? EntryKindColors[k] : 'text.disabled' }}
                            >
                              {formatCurrency(value, profile?.currency, profile?.language)}
                            </Typography>
                          </Box>
                        </TableCell>
                        {idx === 0 && (
                          <TableCell
                            align="right"
                            rowSpan={KINDS.length}
                            sx={{ bgcolor: (theme: Theme) => alpha(theme.palette[getBalanceTone(day.balance)].main, 0.16) }}
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
                    <TableRow key={day.day} sx={rowSx}>
                      <TableCell sx={{ cursor: 'pointer' }} onClick={() => setEntryDate(dayDateString(day))}>
                        <DayCell day={day} />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                          <KindAvatar kind={kind} size={20} />
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 700, color: hasValue ? EntryKindColors[kind] : 'text.disabled' }}
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

      <EntryFormDialog
        key={entryDate ?? 'closed'}
        open={!!entryDate}
        onClose={() => setEntryDate(null)}
        defaultDate={entryDate ?? undefined}
        fixedKind={kind === 'all' ? undefined : kind}
      />
    </Box>
  );
}
