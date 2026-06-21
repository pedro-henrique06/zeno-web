import { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateDailyBudget } from '@/hooks/useUser';
import type { UserProfile } from '@/types';

function DailyBudgetForm({ profile }: { profile: UserProfile }) {
  const updateMutation = useUpdateDailyBudget();
  const [dailyBudget, setDailyBudget] = useState(profile.dailyBudget ?? 0);

  const handleSubmit = () => {
    updateMutation.mutate({ dailyBudget });
  };

  return (
    <>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Defina o valor de diário previsto para projetar seus saldos futuros.
      </Typography>

      <TextField
        fullWidth
        label="Diário previsto"
        type="number"
        margin="normal"
        value={dailyBudget || ''}
        onChange={(e) => setDailyBudget(Number(e.target.value))}
        slotProps={{ htmlInput: { min: 0, step: 0.01 } }}
      />

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        disabled={updateMutation.isPending}
      >
        Salvar
      </Button>
    </>
  );
}

export default function DailyBudgetPage() {
  const navigate = useNavigate();
  const { data: profile, isLoading } = useProfile();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Previsão de diário
        </Typography>
      </Box>

      {isLoading || !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <DailyBudgetForm profile={profile} />
      )}
    </Box>
  );
}
