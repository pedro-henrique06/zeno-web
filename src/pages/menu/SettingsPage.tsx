import { Box, IconButton, List, ListItemButton, ListItemIcon, ListItemText, Paper, Switch, Typography } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/theme/ThemeContext';
import { useLogout } from '@/hooks/useAuth';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const logoutMutation = useLogout();

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          {t('settings.title')}
        </Typography>
      </Box>

      <Paper sx={{ borderRadius: 3 }}>
        <List sx={{ py: 1 }}>
          <ListItemButton onClick={toggleTheme} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
            <ListItemText primary={mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')} />
            <Switch checked={mode === 'dark'} onChange={toggleTheme} />
          </ListItemButton>
          <ListItemButton onClick={() => logoutMutation.mutate()} sx={{ mx: 1, borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings.logout')} />
          </ListItemButton>
        </List>
      </Paper>
    </Box>
  );
}
