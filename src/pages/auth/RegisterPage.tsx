import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  MenuItem,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
import { useRegister } from '@/hooks/useAuth';
import type { Currency, Language, RegisterRequest } from '@/types';

const CURRENCIES: Currency[] = ['BRL', 'USD', 'EUR'];
const LANGUAGES: Language[] = ['PtBR', 'EnUS', 'Es'];

export default function RegisterPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    currency: 'BRL',
    language: 'PtBR',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const registerMutation = useRegister();

  const apiUrl = import.meta.env.VITE_API_URL || '';
  const googleAuthUrl = apiUrl ? `${apiUrl}/auth/oauth/google` : '/api/auth/oauth/google';

  const handleGoogleRegister = () => {
    window.location.assign(googleAuthUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t('auth.register.passwordMismatch'));
      return;
    }

    const submitData = {
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      currency: form.currency,
      language: form.language,
    };

    registerMutation.mutate(submitData, {
      onSuccess: () => {
        navigate('/login');
      },
      onError: (err: unknown) => {
        const axiosError = err as { response?: { data: unknown } };
        const errorData = axiosError.response?.data;
        if (Array.isArray(errorData)) {
          setError(errorData.map((e: unknown) => (e as { error: string }).error).join(', '));
        } else {
          const msg = errorData as { message?: string; error?: string };
          setError(msg?.message || msg?.error || t('auth.register.genericError'));
        }
      },
    });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        bgcolor: 'background.default',
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Zeno
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t('auth.register.tagline')}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }} align="center" gutterBottom>
            {t('auth.register.title')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.register.name')}
              margin="normal"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('auth.register.email')}
              type="email"
              margin="normal"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label={t('auth.register.currency')}
              margin="normal"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}
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
              label={t('auth.register.language')}
              margin="normal"
              value={form.language}
              onChange={(e) => setForm({ ...form, language: e.target.value as Language })}
            >
              {LANGUAGES.map((l) => (
                <MenuItem key={l} value={l}>
                  {t(`language.${l}`)}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label={t('auth.register.password')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              required
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                        aria-label={showPassword ? t('auth.register.hidePassword') : t('auth.register.showPassword')}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              fullWidth
              label={t('auth.register.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              required
              autoComplete="new-password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={handleGoogleRegister}
              startIcon={<GoogleIcon />}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {t('auth.register.googleButton')}
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              sx={{ mb: 2, py: 1.5 }}
            >
              {registerMutation.isPending ? t('auth.register.submitting') : t('auth.register.submit')}
            </Button>
            <Typography variant="body2" align="center">
              {t('auth.register.haveAccount')}{' '}
              <MuiLink component={Link} to="/login" underline="hover">
                {t('auth.register.login')}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
