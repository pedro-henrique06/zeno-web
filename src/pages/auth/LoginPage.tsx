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
  Divider,
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(form, {
      onSuccess: () => {
        navigate('/');
      },
      onError: (err) => {
        setError((err as any).response?.data?.message || t('auth.login.genericError'));
      },
    });
  };

  const handleGoogleLogin = () => {
    window.location.assign('/api/auth/oauth/google');
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
            {t('auth.login.tagline')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('auth.login.subtitle')}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }} align="center" gutterBottom>
            {t('auth.login.title')}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t('auth.login.email')}
              type="email"
              margin="normal"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label={t('auth.login.password')}
              type={showPassword ? 'text' : 'password'}
              margin="normal"
              required
              autoComplete="current-password"
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
                        aria-label={showPassword ? t('auth.login.hidePassword') : t('auth.login.showPassword')}
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Box sx={{ textAlign: 'right', mt: 1 }}>
              <MuiLink
                component={Link}
                to="#"
                underline="hover"
                variant="body2"
                color="text.secondary"
                sx={{ fontSize: '0.875rem' }}
              >
                {t('auth.login.forgotPassword')}
              </MuiLink>
            </Box>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {loginMutation.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
            </Button>
            <Divider sx={{ my: 3 }} />
            <Button
              fullWidth
              type="button"
              variant="outlined"
              size="large"
              onClick={handleGoogleLogin}
              startIcon={<GoogleIcon />}
              sx={{ py: 1.5, textTransform: 'none', fontWeight: 500 }}
            >
              {t('auth.login.googleButton')}
            </Button>
            <Typography variant="body2" align="center" sx={{ mt: 3 }}>
              {t('auth.login.noAccount')}{' '}
              <MuiLink component={Link} to="/register" underline="hover">
                {t('auth.login.createAccount')}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
