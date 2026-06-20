import { useState } from 'react';
import {
  Box,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TimelineIcon from '@mui/icons-material/Timeline';
import { useAllEntries } from '@/hooks/useEntries';
import { useWallets } from '@/hooks/useWallets';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';
import { EntryType } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { BalancesHorizonDialog } from '@/components/BalancesHorizonDialog';
import { getEntryKind } from '@/utils/entryKind';

export default function BalancesPage() {
  const { t, locale } = useLanguage();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [horizonOpen, setHorizonOpen] = useState(false);

  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: entries, isLoading: entriesLoading } = useAllEntries(month, year);

  if (walletsLoading || entriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;
  const list = entries ?? [];
  const monthNet = list.reduce(
    (sum, e) => sum + (e.type === EntryType.Credit ? e.value : -e.value),
    0,
  );
  const baseline = totalBalance - monthNet;

  const daysInMonth = new Date(year, month, 0).getDate();
  const dailyByDay = new Map<number, number>();
  const netByDay = new Map<number, number>();
  for (const entry of list) {
    const d = new Date(entry.date);
    if (isNaN(d.getTime())) continue;
    const day = d.getDate();
    netByDay.set(day, (netByDay.get(day) ?? 0) + (entry.type === EntryType.Credit ? entry.value : -entry.value));
    if (getEntryKind(entry) === 'diario') {
      dailyByDay.set(day, (dailyByDay.get(day) ?? 0) + entry.value);
    }
  }

  const rows = Array.from({ length: daysInMonth }, (_, i) => i + 1).reduce<
    { day: number; daily: number; balance: number }[]
  >((acc, day) => {
    const previousBalance = acc.length > 0 ? acc[acc.length - 1].balance : baseline;
    const balance = previousBalance + (netByDay.get(day) ?? 0);
    acc.push({ day, daily: dailyByDay.get(day) ?? 0, balance });
    return acc;
  }, []);

  const avgDailyNet = daysInMonth > 0 ? monthNet / daysInMonth : 0;

  const getBalanceColor = (balance: number): string => {
    if (balance === 0) return 'error.main';
    if (balance > 8000) return 'success.main';
    if (balance > 0) return 'warning.main';
    return 'error.main';
  };

  const getDailyColor = (net: number): string => {
    return net < 0 ? 'error.main' : 'text.primary';
  };

  return (
    <Box>
      <MonthSwitcher
        month={month}
        year={year}
        onChange={(m, y) => { setMonth(m); setYear(y); }}
        locale={locale}
        endAdornment={
          <IconButton size="small" onClick={() => setHorizonOpen(true)}>
            <TimelineIcon fontSize="small" />
          </IconButton>
        }
      />

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>{t.balances.day}</TableCell>
              <TableCell align="right">{t.totals.dailyLabel}</TableCell>
              <TableCell align="right">{t.balances.balanceColumn}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const dayNet = netByDay.get(row.day) ?? 0;
              return (
                <TableRow key={row.day}>
                  <TableCell>{row.day}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: getDailyColor(dayNet) }}
                    >
                      {row.daily > 0 ? formatCurrency(row.daily) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 700, color: getBalanceColor(row.balance) }}
                    >
                      {formatCurrency(row.balance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      <BalancesHorizonDialog
        open={horizonOpen}
        onClose={() => setHorizonOpen(false)}
        month={month}
        year={year}
        baseline={baseline}
        avgDailyNet={avgDailyNet}
        locale={locale}
      />
    </Box>
  );
}
