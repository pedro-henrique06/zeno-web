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
import { useRegister } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import type { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const { t } = useLanguage();

  const registerMutation = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    registerMutation.mutate(form, {
      onError: (err) => {
        setError(
          (err as any).response?.data?.message || t.auth.registerError,
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
            {t.auth.registerTitle}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align="center"
            sx={{ mb: 3 }}
          >
            {t.auth.registerSubtitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.auth.name}
              margin="normal"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
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
              disabled={registerMutation.isPending}
              sx={{ mt: 2, mb: 2 }}
            >
              {registerMutation.isPending ? t.auth.creatingAccount : t.auth.createAccount}
            </Button>
            <Typography variant="body2" align="center">
              {t.auth.haveAccount}{' '}
              <MuiLink component={Link} to="/login" underline="hover">
                {t.auth.signInLink}
              </MuiLink>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
