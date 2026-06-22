import { useState } from 'react';
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
import { usePerformanceHorizon } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';

interface PerformanceHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

function monthLabel(month: number) {
  const date = new Date(2000, month - 1, 1);
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function PerformanceHorizonDialog({ open, onClose, initialYear }: PerformanceHorizonDialogProps) {
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = usePerformanceHorizon(year, open);

  const months = data?.months ?? [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Performance
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
            <Typography color="error">Não foi possível carregar a performance.</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Performance é como uma foto do seu mês financeiro: é a diferença entre quanto entrou e quanto saiu.
                Entradas menos saídas (fixas, diárias, economias, cartão e previsão de diário) = performance.
              </Typography>
            </Paper>

            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total por mês
            </Typography>
            {months.map((m) => (
              <Box
                key={m.month}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.25,
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>{monthLabel(m.month)}</Typography>
                <Typography sx={{ fontWeight: 700, color: m.performance < 0 ? 'error.main' : 'text.primary' }}>
                  {formatCurrency(m.performance)}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
