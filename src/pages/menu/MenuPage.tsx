import {
  Avatar,
  Box,
  Chip,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import AssessmentIcon from '@mui/icons-material/Assessment';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import LanguageIcon from '@mui/icons-material/Language';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { useThemeContext } from '@/theme/ThemeContext';

export default function MenuPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { t, locale, setLocale } = useLanguage();
  const { mode, toggleTheme } = useThemeContext();

  const secondaryLinks = [
    { label: t.nav.wallets, path: '/wallets', icon: <AccountBalanceWalletIcon /> },
    { label: t.nav.entries, path: '/entries', icon: <ReceiptLongIcon /> },
    { label: t.nav.homes, path: '/homes', icon: <HomeIcon /> },
    { label: t.nav.salaries, path: '/salaries', icon: <AutorenewIcon /> },
    { label: t.nav.reports, path: '/reports', icon: <AssessmentIcon /> },
  ];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t.menu.title}
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main', fontSize: 22 }}>
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700 }} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Paper sx={{ borderRadius: 3, mb: 3 }}>
        <List sx={{ py: 1 }}>
          <ListItemButton disabled sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={t.menu.editProfile} />
            <Chip label={t.menu.comingSoon} size="small" variant="outlined" />
          </ListItemButton>
          <ListItemButton disabled sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>
              <EventNoteIcon />
            </ListItemIcon>
            <ListItemText primary={t.menu.dailyForecast} />
            <Chip label={t.menu.comingSoon} size="small" variant="outlined" />
          </ListItemButton>
        </List>
      </Paper>

      <Typography variant="overline" color="text.secondary" sx={{ pl: 1, fontWeight: 700 }}>
        {t.menu.more}
      </Typography>
      <Paper sx={{ borderRadius: 3, mb: 3, mt: 1 }}>
        <List sx={{ py: 1 }}>
          {secondaryLinks.map((link) => (
            <ListItemButton key={link.path} sx={{ mx: 1, borderRadius: 2 }} onClick={() => navigate(link.path)}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Paper>

      <Paper sx={{ borderRadius: 3 }}>
        <List sx={{ py: 1 }}>
          <ListItemButton onClick={() => setLocale(locale === 'pt' ? 'en' : 'pt')} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>
              <LanguageIcon />
            </ListItemIcon>
            <ListItemText primary={t.nav.language} />
          </ListItemButton>
          <ListItemButton onClick={toggleTheme} sx={{ mx: 1, borderRadius: 2 }}>
            <ListItemIcon>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
            <ListItemText primary={mode === 'dark' ? t.nav.lightMode : t.nav.darkMode} />
            <Switch checked={mode === 'dark'} onChange={toggleTheme} />
          </ListItemButton>
          <Divider sx={{ my: 0.5 }} />
          <ListItemButton onClick={() => logoutMutation.mutate()} sx={{ mx: 1, borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t.nav.logout} />
          </ListItemButton>
        </List>
      </Paper>
    </Box>
  );
}
