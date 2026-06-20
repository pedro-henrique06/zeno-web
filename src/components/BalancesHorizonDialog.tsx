import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';
import type { Locale } from '@/i18n/translations';

interface BalancesHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  month: number;
  year: number;
  baseline: number;
  avgDailyNet: number;
  locale: Locale;
}

function monthLabel(month: number, year: number, locale: Locale) {
  const date = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat(locale === 'pt' ? 'pt-BR' : 'en-US', {
    month: 'short',
    year: '2-digit',
  }).format(date);
}

export function BalancesHorizonDialog({
  open,
  onClose,
  month,
  year,
  baseline,
  avgDailyNet,
  locale,
}: BalancesHorizonDialogProps) {
  const { t } = useLanguage();

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date(year, month - 1 + i, 1);
    return { month: date.getMonth() + 1, year: date.getFullYear() };
  });

  const getBalanceColor = (balance: number): string => {
    if (balance === 0) return 'error.main';
    if (balance > 8000) return 'success.main';
    if (balance > 0) return 'warning.main';
    return 'error.main';
  };

  const daysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
  const maxDays = Math.max(...months.map((m) => daysInMonth(m.month, m.year)));

  let dayCursor = 0;
  const monthDayOffsets = months.map((m) => {
    const start = dayCursor;
    dayCursor += daysInMonth(m.month, m.year);
    return start;
  });

  const balanceFor = (monthIndex: number, day: number) => {
    const totalDayIndex = monthDayOffsets[monthIndex] + (day - 1);
    return baseline + avgDailyNet * totalDayIndex;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t.balances.horizon}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        <TableContainer sx={{ maxHeight: '70vh' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t.balances.day}</TableCell>
                {months.map((m, i) => (
                  <TableCell key={i} align="right" sx={{ textTransform: 'capitalize', fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {monthLabel(m.month, m.year, locale)}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => (
                <TableRow key={day}>
                  <TableCell>{day}</TableCell>
                  {months.map((m, i) => {
                    if (day > daysInMonth(m.month, m.year)) {
                      return <TableCell key={i} align="right" />;
                    }
                    const value = balanceFor(i, day);
                    return (
                      <TableCell key={i} align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Typography
                          variant="body2"
                          sx={{ fontWeight: 600, color: getBalanceColor(value) }}
                        >
                          {formatCurrency(value)}
                        </Typography>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </Dialog>
  );
}
