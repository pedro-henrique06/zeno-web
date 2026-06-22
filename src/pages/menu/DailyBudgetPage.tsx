import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateDailyBudget } from '@/hooks/useUser';
import { useMonthlyExpenseCategories } from '@/hooks/useMonthlyExpenseCategories';
import { MonthlyExpenseCategorySheet } from '@/components/MonthlyExpenseCategorySheet';
import { formatCurrency } from '@/utils/currency';
import type { MonthlyExpenseCategory } from '@/types';

export default function DailyBudgetPage() {
  const navigate = useNavigate();
  const { data: profile } = useProfile();
  const { data: categories, isLoading, isError } = useMonthlyExpenseCategories();
  const { mutate: syncDailyBudget } = useUpdateDailyBudget();

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MonthlyExpenseCategory | null>(null);

  const daysInMonth = dayjs().daysInMonth();
  const totalMensal = (categories ?? []).reduce((sum, c) => sum + c.amount, 0);
  const dailyValue = daysInMonth > 0 ? totalMensal / daysInMonth : 0;

  useEffect(() => {
    if (!categories || !profile) return;
    const rounded = Math.round(dailyValue * 100) / 100;
    const current = Math.round((profile.dailyBudget ?? 0) * 100) / 100;
    if (rounded !== current) {
      syncDailyBudget({ dailyBudget: rounded });
    }
  }, [categories, profile, dailyValue, syncDailyBudget]);

  const handleAdd = () => {
    setEditingCategory(null);
    setSheetOpen(true);
  };

  const handleEdit = (category: MonthlyExpenseCategory) => {
    setEditingCategory(category);
    setSheetOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          Previsão de diário
        </Typography>
        <IconButton onClick={handleAdd}>
          <AddIcon />
        </IconButton>
      </Box>

      {isError ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">Não foi possível carregar a previsão de diário. Tente novamente.</Typography>
        </Box>
      ) : isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {categories && categories.length > 0 && (
            <Paper sx={{ borderRadius: 3, mb: 2, overflow: 'hidden' }}>
              <List sx={{ p: 0 }}>
                {categories.map((category, idx) => (
                  <ListItemButton
                    key={category.id}
                    onClick={() => handleEdit(category)}
                    sx={{
                      borderBottom: idx < categories.length - 1 ? '1px solid' : 'none',
                      borderColor: 'divider',
                      py: 1.5,
                      px: 2,
                    }}
                  >
                    <ListItemText primary={category.name} slotProps={{ primary: { sx: { fontWeight: 700 } } }} />
                    <Typography sx={{ fontWeight: 700 }}>{formatCurrency(category.amount)}</Typography>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          )}

          <Paper sx={{ borderRadius: 3, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontWeight: 700 }}>Total mensal</Typography>
              <Typography>{formatCurrency(totalMensal)}</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography sx={{ fontWeight: 700 }}>Dividido por</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Typography>{daysInMonth} dias</Typography>
                <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </Box>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="h4" sx={{ fontWeight: 700, textAlign: 'right' }}>
              {formatCurrency(dailyValue)}
            </Typography>
          </Paper>
        </>
      )}

      <MonthlyExpenseCategorySheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        category={editingCategory}
      />
    </Box>
  );
}
