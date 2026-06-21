import { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useProfile, useUpdateProfile } from '@/hooks/useUser';
import type { UpdateProfileRequest, UserProfile } from '@/types';

function EditProfileForm({ profile }: { profile: UserProfile }) {
  const updateMutation = useUpdateProfile();
  const [form, setForm] = useState<UpdateProfileRequest>({
    name: profile.name,
    email: profile.email,
    phone: profile.phone ?? '',
    document: profile.document ?? '',
    birthDate: profile.birthDate ?? '',
  });

  const handleSubmit = () => {
    updateMutation.mutate(form);
  };

  return (
    <>
      <TextField
        fullWidth
        label="Nome"
        margin="normal"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <TextField
        fullWidth
        label="Email"
        type="email"
        margin="normal"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <TextField
        fullWidth
        label="Telefone"
        margin="normal"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />
      <TextField
        fullWidth
        label="CPF/CNPJ"
        margin="normal"
        value={form.document}
        onChange={(e) => setForm({ ...form, document: e.target.value })}
      />
      <TextField
        fullWidth
        label="Data de nascimento"
        type="date"
        margin="normal"
        value={form.birthDate}
        onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
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

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = useProfile();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Editar perfil
        </Typography>
      </Box>

      {isError ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">Não foi possível carregar o perfil. Tente novamente.</Typography>
        </Box>
      ) : isLoading || !profile ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <EditProfileForm profile={profile} />
      )}
    </Box>
  );
}
