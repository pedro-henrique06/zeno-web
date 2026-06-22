import { useState } from 'react';
import { Box, Button, ButtonBase, Drawer, IconButton, InputBase, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import EditIcon from '@mui/icons-material/Edit';
import BackspaceOutlinedIcon from '@mui/icons-material/BackspaceOutlined';
import {
  useCreateMonthlyExpenseCategory,
  useUpdateMonthlyExpenseCategory,
  useDeleteMonthlyExpenseCategory,
} from '@/hooks/useMonthlyExpenseCategories';
import type { MonthlyExpenseCategory } from '@/types';

interface MonthlyExpenseCategorySheetProps {
  open: boolean;
  onClose: () => void;
  category?: MonthlyExpenseCategory | null;
}

const MAX_AMOUNT_CENTS = 99_999_999;
const KEYPAD_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export function MonthlyExpenseCategorySheet({ open, onClose, category }: MonthlyExpenseCategorySheetProps) {
  const [amountCents, setAmountCents] = useState(0);
  const [name, setName] = useState('');
  const [wasOpen, setWasOpen] = useState(open);
  const isEditing = !!category;

  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setAmountCents(category ? Math.round(category.amount * 100) : 0);
      setName(category?.name ?? '');
    }
  }

  const createMutation = useCreateMonthlyExpenseCategory();
  const updateMutation = useUpdateMonthlyExpenseCategory();
  const deleteMutation = useDeleteMonthlyExpenseCategory();
  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  const handleKeyPress = (key: string) => {
    if (key === 'back') {
      setAmountCents((prev) => Math.floor(prev / 10));
    } else if (key !== '') {
      setAmountCents((prev) => (prev >= MAX_AMOUNT_CENTS ? prev : prev * 10 + Number(key)));
    }
  };

  const handleSubmit = () => {
    const amount = amountCents / 100;
    if (isEditing && category) {
      updateMutation.mutate({ id: category.id, name, amount }, { onSuccess: onClose });
    } else {
      createMutation.mutate({ name, amount }, { onSuccess: onClose });
    }
  };

  const handleDelete = () => {
    if (category) {
      deleteMutation.mutate(category.id, { onSuccess: onClose });
    }
  };

  const displayAmount = (amountCents / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      slotProps={{
        paper: {
          sx: {
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            pb: 'env(safe-area-inset-bottom)',
          },
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, pt: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.secondary' }}>
            R$
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {displayAmount}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isEditing && (
            <IconButton onClick={handleDelete} disabled={isPending}>
              <DeleteOutlineIcon />
            </IconButton>
          )}
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 2,
          mt: 1,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <EditIcon fontSize="small" sx={{ color: 'text.secondary' }} />
        <InputBase fullWidth placeholder="Descrição" value={name} onChange={(e) => setName(e.target.value)} />
      </Box>

      <Box sx={{ px: 2, py: 2 }}>
        <Button
          fullWidth
          size="large"
          onClick={handleSubmit}
          disabled={!name.trim() || isPending}
          sx={{
            borderRadius: 6,
            bgcolor: 'text.primary',
            color: 'background.paper',
            py: 1.5,
            fontWeight: 700,
            '&:hover': { bgcolor: 'text.primary' },
          }}
        >
          {isEditing ? 'Salvar gasto mensal' : 'Adicionar gasto mensal'}
        </Button>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', px: 2, pb: 2 }}>
        {KEYPAD_KEYS.map((key, idx) =>
          key === '' ? (
            <Box key={`empty-${idx}`} />
          ) : (
            <ButtonBase
              key={key}
              onClick={() => handleKeyPress(key)}
              sx={{ borderRadius: 2, py: 1.5, fontSize: 24 }}
            >
              {key === 'back' ? <BackspaceOutlinedIcon /> : key}
            </ButtonBase>
          ),
        )}
      </Box>
    </Drawer>
  );
}
