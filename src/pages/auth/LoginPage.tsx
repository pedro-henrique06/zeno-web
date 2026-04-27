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
} from '@mui/material';
import { Link } from 'react-router-dom';
import { useLogin } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import type { LoginRequest } from '@/types';

export default function LoginPage() {
  const [form, setForm] = useState<LoginRequest>({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const loginMutation = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate(form, {
      onError: (err) => {
        setError(
          (err as any).response?.data?.message || t.auth.loginError,
        );
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
      }}
    >
      <Container maxWidth="sm">
        <Paper sx={{ p: 4, mt: -4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }} align="center" gutterBottom>
            {t.auth.signInTitle}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            {t.auth.signInSubtitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.auth.email}
              type="email"
              margin="normal"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.password}
              type="password"
              margin="normal"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mt: 2, mb: 2 }}
            >
              {loginMutation.isPending ? t.auth.signingIn : t.auth.signIn}
            </Button>
            <Typography variant="body2" align="center">
              {t.auth.noAccount}{' '}
              <MuiLink component={Link} to="/register" underline="hover">
                {t.auth.createOne}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
