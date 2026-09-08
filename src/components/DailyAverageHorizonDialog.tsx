import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useDailyAverageHorizon } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency, LANGUAGE_LOCALES } from '@/utils/currency';
import { EntryKind } from '@/types';

interface DailyAverageHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

export function DailyAverageHorizonDialog({ open, onClose, initialYear }: DailyAverageHorizonDialogProps) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = useDailyAverageHorizon(year, open);

  const months = data?.months ?? [];

  const monthLabel = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    const label = new Intl.DateTimeFormat(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], { month: 'long' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const openMonth = (month: number) => {
    onClose();
    navigate(`/entries?month=${month}&year=${year}&kinds=${EntryKind.Diario}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('horizon.dailyAverage.title')}
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
      <DialogContent>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : isError || !data ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography color="error">{t('horizon.dailyAverage.loadError')}</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('horizon.dailyAverage.explanation')}
              </Typography>
            </Paper>

            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              {t('horizon.dailyAverage.averageByMonth')}
            </Typography>
            {months.map((m) => (
              <Box
                key={m.month}
                onClick={() => openMonth(m.month)}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{monthLabel(m.month)}</Typography>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontWeight: 700 }}>{formatCurrency(m.dailyAverage, profile?.currency, profile?.language)}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatCurrency(m.totalDiario, profile?.currency, profile?.language)} / {m.daysInMonth}
                  </Typography>
                </Box>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
