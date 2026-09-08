import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useBalancesHorizon } from '@/hooks/useBalances';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency, LANGUAGE_LOCALES } from '@/utils/currency';
import { getBalanceColor } from '@/utils/balanceColor';

interface BalancesHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

export function BalancesHorizonDialog({ open, onClose, initialYear }: BalancesHorizonDialogProps) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = useBalancesHorizon(year, open);

  const months = data?.months ?? [];
  const maxDays = Math.max(0, ...months.map((m) => m.days.length));

  const monthLabel = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    return new Intl.DateTimeFormat(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], { month: 'short' }).format(date);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('horizon.balances.title')}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="small" onClick={() => setYear((y) => y - 1)}>
              <ChevronLeftIcon />
            </IconButton>
            <Typography sx={{ fontWeight: 700, minWidth: 48, textAlign: 'center' }}>{year}</Typography>
            <IconButton size="small" onClick={() => setYear((y) => y + 1)}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{t('horizon.balances.loadError')}</Typography>
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: '70vh' }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>{t('horizon.balances.day')}</TableCell>
                  {months.map((m) => (
                    <TableCell key={m.month} align="right" sx={{ textTransform: 'capitalize', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      {monthLabel(m.month)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((day) => (
                  <TableRow key={day}>
                    <TableCell>{day}</TableCell>
                    {months.map((m) => {
                      const dayData = m.days[day - 1];
                      if (!dayData) {
                        return <TableCell key={m.month} align="right" />;
                      }
                      return (
                        <TableCell key={m.month} align="right" sx={{ whiteSpace: 'nowrap' }}>
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: getBalanceColor(dayData.balance) }}
                          >
                            {formatCurrency(dayData.balance, profile?.currency, profile?.language)}
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
