import { useState } from 'react';
import { Box, Alert, Link as MuiLink, InputAdornment, IconButton } from '@mui/material';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useTranslation } from 'react-i18next';
import { useLogin } from '@/hooks/useAuth';
import type { LoginRequest } from '@/types';
import { AuthShell, AuthTextField, AuthSubmitButton, AuthSecondaryButton } from './AuthShell';

export default function LoginPage() {
  const { t } = useTranslation();
  const [form, setForm] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [searchParams] = useSearchParams();
  const [error, setError] = useState(searchParams.get('oauthError') ? t('auth.login.genericError') : '');
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
    const apiUrl = import.meta.env.VITE_API_URL || '';
    window.location.assign(apiUrl ? `${apiUrl}/auth/oauth/google` : '/api/auth/oauth/google');
  };

  return (
    <AuthShell
      title={t('auth.login.welcome')}
      subtitle={t('auth.login.tagline')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <MuiLink component={Link} to="/register" underline="always" color="text.primary" sx={{ fontWeight: 700 }}>
            {t('auth.login.createAccount')}
          </MuiLink>
        </>
      }
    >
      {error && (
        <Alert severity="error" sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <AuthTextField
          label={t('auth.login.email')}
          type="email"
          required
          autoComplete="email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <AuthTextField
          label={t('auth.login.password')}
          type={showPassword ? 'text' : 'password'}
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
          <MuiLink component={Link} to="#" underline="hover" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {t('auth.login.forgotPassword')}
          </MuiLink>
        </Box>
        <AuthSubmitButton disabled={loginMutation.isPending}>
          {loginMutation.isPending ? t('auth.login.submitting') : t('auth.login.submit')}
        </AuthSubmitButton>
        <AuthSecondaryButton onClick={handleGoogleLogin} startIcon={<GoogleIcon />}>
          {t('auth.login.googleButton')}
        </AuthSecondaryButton>
      </Box>
    </AuthShell>
  );
}
