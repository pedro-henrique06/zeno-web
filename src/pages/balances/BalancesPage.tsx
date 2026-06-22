import { useState, type MouseEvent } from 'react';
import {
  Avatar,
  Box,
  CircularProgress,
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
import { useBalances } from '@/hooks/useBalances';
import { formatCurrency } from '@/utils/currency';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EntryKind } from '@/types';
import type { BalanceDay } from '@/types';
import { EntryKindColors, EntryKindLetters, EntryKindLabels } from '@/utils/entryKind';

const KINDS = [EntryKind.Diario, EntryKind.Entrada, EntryKind.Saida, EntryKind.Economia, EntryKind.Cartao];

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

function getBalanceColor(value: number): string {
  if (value <= 0) return 'error.main';
  if (value < 10000) return 'warning.main';
  return 'success.main';
}

export default function BalancesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [kind, setKind] = useState<EntryKind>(EntryKind.Diario);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const { data, isLoading, isError } = useBalances(month, year);

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
        <Typography color="error">Não foi possível carregar os saldos. Tente novamente.</Typography>
      </Box>
    );
  }

  const days = data?.days ?? [];

  return (
    <Box>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Dia</TableCell>
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
                  <KindAvatar kind={kind} size={20} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {EntryKindLabels[kind]}
                  </Typography>
                  <KeyboardArrowDownIcon fontSize="small" />
                </Box>
                <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
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
                      <ListItemText>{EntryKindLabels[k]}</ListItemText>
                    </MenuItem>
                  ))}
                </Menu>
              </TableCell>
              <TableCell align="right">Saldos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => {
              const rowSx = day.isToday
                ? { bgcolor: (theme: Theme) => alpha(theme.palette.primary.main, 0.12) }
                : day.isProjected
                  ? { opacity: 0.6 }
                  : {};
              const value = day[KIND_FIELD[kind]] as number;
              const hasValue = value > 0;
              return (
                <TableRow key={day.day} sx={rowSx}>
                  <TableCell>
                    {day.isToday ? (
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
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                      <KindAvatar kind={kind} size={20} />
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 700, color: hasValue ? EntryKindColors[kind] : 'text.disabled' }}
                      >
                        {formatCurrency(value)}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700, color: getBalanceColor(day.balance) }}>
                      {formatCurrency(day.balance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
