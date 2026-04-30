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
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import GoogleIcon from '@mui/icons-material/Google';
import { useRegister } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import type { RegisterRequest } from '@/types';

export default function RegisterPage() {
  const [form, setForm] = useState<RegisterRequest>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    document: '',
    birthDate: '',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { t } = useLanguage();
  const navigate = useNavigate();

  const registerMutation = useRegister();

  const handleGoogleRegister = () => {
    // Usar URL absoluta sem passar pelo axios para evitar interceptadores
    window.location.assign('/api/auth/oauth/google');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError(t.auth.passwordMismatch || 'As senhas não conferem');
      return;
    }

    const submitData = {
      name: form.name,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
      phone: form.phone || undefined,
      document: form.document || undefined,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : undefined,
    };

    registerMutation.mutate(submitData, {
      onSuccess: () => {
        navigate('/login');
      },
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
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
            Zeno
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {t.auth.registerSubtitle}
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }} align="center" gutterBottom>
            {t.auth.registerTitle}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label={t.auth.name}
              margin="normal"
              required
              autoComplete="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.email}
              type="email"
              margin="normal"
              required
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.phone || 'Telefone'}
              margin="normal"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.document || 'CPF/CNPJ'}
              margin="normal"
              value={form.document}
              onChange={(e) => setForm({ ...form, document: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.birthDate || 'Data de Nascimento'}
              type="date"
              margin="normal"
              slotProps={{
                inputLabel: { shrink: true }
              }}
              value={form.birthDate}
              onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
            />
            <TextField
              fullWidth
              label={t.auth.password}
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
                        aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
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
              label={t.auth.confirmPassword || 'Confirmar Senha'}
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
              {t.auth.signInWithGoogle || 'Sign up with Google'}
            </Button>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              size="large"
              disabled={registerMutation.isPending}
              sx={{ mb: 2, py: 1.5 }}
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
