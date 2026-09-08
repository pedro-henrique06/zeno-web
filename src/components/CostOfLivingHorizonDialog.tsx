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
import { useCostOfLivingHorizon } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency, LANGUAGE_LOCALES } from '@/utils/currency';
import { EntryKind } from '@/types';

interface CostOfLivingHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

const COST_OF_LIVING_KINDS = [EntryKind.Saida, EntryKind.Diario, EntryKind.Cartao];

export function CostOfLivingHorizonDialog({ open, onClose, initialYear }: CostOfLivingHorizonDialogProps) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const navigate = useNavigate();
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = useCostOfLivingHorizon(year, open);

  const months = data?.months ?? [];

  const monthLabel = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    const label = new Intl.DateTimeFormat(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], { month: 'long' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  const openMonth = (month: number) => {
    onClose();
    navigate(`/entries?month=${month}&year=${year}&kinds=${COST_OF_LIVING_KINDS.join(',')}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('horizon.costOfLiving.title')}
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
            <Typography color="error">{t('horizon.costOfLiving.loadError')}</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('horizon.costOfLiving.explanation')}
              </Typography>
            </Paper>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('horizon.costOfLiving.totalYear')}
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(data.costOfLiving, profile?.currency, profile?.language)}
              </Typography>
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              {t('horizon.costOfLiving.totalByMonth')}
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
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(m.costOfLiving, profile?.currency, profile?.language)}</Typography>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
