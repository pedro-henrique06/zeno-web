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
import { useCostOfLivingHorizon } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';

interface CostOfLivingHorizonDialogProps {
  open: boolean;
  onClose: () => void;
  initialYear: number;
}

const COST_OF_LIVING_KINDS = [EntryKind.Saida, EntryKind.Diario, EntryKind.Cartao];

function monthLabel(month: number) {
  const date = new Date(2000, month - 1, 1);
  const label = new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function CostOfLivingHorizonDialog({ open, onClose, initialYear }: CostOfLivingHorizonDialogProps) {
  const navigate = useNavigate();
  const [year, setYear] = useState(initialYear);

  const { data, isLoading, isError } = useCostOfLivingHorizon(year, open);

  const months = data?.months ?? [];

  const openMonth = (month: number) => {
    onClose();
    navigate(`/entries?month=${month}&year=${year}&kinds=${COST_OF_LIVING_KINDS.join(',')}`);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        Custo de vida
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
            <Typography color="error">Não foi possível carregar o custo de vida.</Typography>
          </Box>
        ) : (
          <>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 3, mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Custo de vida é quanto você gasta para viver: saídas, diários, gastos com cartão e a previsão de
                diário para os dias que ainda faltam no mês.
              </Typography>
            </Paper>

            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Total no ano
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                {formatCurrency(data.costOfLiving)}
              </Typography>
            </Box>

            <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700 }}>
              Total por mês
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
                <Typography sx={{ fontWeight: 700 }}>{formatCurrency(m.costOfLiving)}</Typography>
              </Box>
            ))}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
