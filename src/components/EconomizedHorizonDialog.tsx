import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useTranslation } from 'react-i18next';
import { useEconomizedHorizon } from '@/hooks/useSummary';
import { useProfile } from '@/hooks/useUser';
import { formatCurrency, LANGUAGE_LOCALES } from '@/utils/currency';
import { EntryKind } from '@/types';
import type { Currency, Language } from '@/types';
import { EntryKindColors } from '@/utils/entryKind';

interface EconomizedHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

function EconomizedBar({
  percent,
  economia,
  entrada,
  currency,
  language,
}: {
  percent: number;
  economia: number;
  entrada: number;
  currency?: Currency;
  language?: Language;
}) {
  const { t } = useTranslation();
  return (
    <Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(100, Math.max(0, percent))}
        sx={{
          height: 8,
          borderRadius: 999,
          bgcolor: 'action.hover',
          '& .MuiLinearProgress-bar': { bgcolor: EntryKindColors[EntryKind.Entrada], borderRadius: 999 },
        }}
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {t('horizon.economized.savingsLabel', { value: formatCurrency(economia, currency, language) })}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('horizon.economized.incomeLabel', { value: formatCurrency(entrada, currency, language) })}
        </Typography>
      </Box>
    </Box>
  );
}

export function EconomizedHorizonDialog({ open, onClose, initialYear }: EconomizedHorizonDialogProps) {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = useEconomizedHorizon(year, open);

  const months = data?.months ?? [];

  const monthLabel = (month: number) => {
    const date = new Date(2000, month - 1, 1);
    const label = new Intl.DateTimeFormat(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], { month: 'long' }).format(date);
    return label.charAt(0).toUpperCase() + label.slice(1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {t('horizon.economized.title')}
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
            <Typography color="error">{t('horizon.economized.loadError')}</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                {t('horizon.economized.explanation')}
              </Typography>
            </Paper>

            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              {t('horizon.economized.totalYear')}
            </Typography>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              {data.economizedPercent.toFixed(1)}%
            </Typography>
            <EconomizedBar
              percent={data.economizedPercent}
              economia={data.economia}
              entrada={data.entrada}
              currency={profile?.currency}
              language={profile?.language}
            />

            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 700, display: 'block', mt: 3, mb: 1 }}
            >
              {t('horizon.economized.totalByMonth')}
            </Typography>
            {months.map((m) => (
              <Box key={m.month} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography sx={{ fontWeight: 700 }}>{monthLabel(m.month)}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{m.economizedPercent.toFixed(1)}%</Typography>
                </Box>
                <EconomizedBar
                  percent={m.economizedPercent}
                  economia={m.economia}
                  entrada={m.entrada}
                  currency={profile?.currency}
                  language={profile?.language}
                />
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
