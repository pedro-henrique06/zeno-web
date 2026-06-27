import { useState } from 'react';
import { Box, Button, CircularProgress, IconButton, MenuItem, TextField, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProfile, useUpdateProfile, useUpdateCurrency, useUpdateLanguage } from '@/hooks/useUser';
import type { Currency, Language, UpdateProfileRequest, UserProfile } from '@/types';

const CURRENCIES: Currency[] = ['BRL', 'USD', 'EUR'];
const LANGUAGES: Language[] = ['PtBR', 'EnUS', 'Es'];

function EditProfileForm({ profile }: { profile: UserProfile }) {
  const { t } = useTranslation();
  const updateMutation = useUpdateProfile();
  const updateCurrencyMutation = useUpdateCurrency();
  const updateLanguageMutation = useUpdateLanguage();
  const [form, setForm] = useState<UpdateProfileRequest>({
    name: profile.name,
    email: profile.email,
  });

  const handleSubmit = () => {
    updateMutation.mutate(form);
  };

  return (
    <>
      <TextField
        fullWidth
        label={t('editProfile.name')}
        margin="normal"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <TextField
        fullWidth
        label={t('editProfile.email')}
        type="email"
        margin="normal"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <TextField
        fullWidth
        select
        label={t('editProfile.currency')}
        margin="normal"
        value={profile.currency}
        onChange={(e) => updateCurrencyMutation.mutate({ currency: e.target.value as Currency })}
      >
        {CURRENCIES.map((c) => (
          <MenuItem key={c} value={c}>
            {t(`currency.${c}`)}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        fullWidth
        select
        label={t('editProfile.language')}
        margin="normal"
        value={profile.language}
        onChange={(e) => updateLanguageMutation.mutate({ language: e.target.value as Language })}
      >
        {LANGUAGES.map((l) => (
          <MenuItem key={l} value={l}>
            {t(`language.${l}`)}
          </MenuItem>
        ))}
      </TextField>

      <Button
        fullWidth
        variant="contained"
        size="large"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
        disabled={updateMutation.isPending}
      >
        {t('editProfile.save')}
      </Button>
    </>
  );
}

export default function EditProfilePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: profile, isLoading, isError } = useProfile();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('editProfile.title')}
        </Typography>
      </Box>

      {isError ? (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="error">{t('editProfile.loadError')}</Typography>
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
