import { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Typography,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteSweepIcon from '@mui/icons-material/DeleteSweep';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/contexts/AuthContext';
import { useResetAccount } from '@/hooks/useAuth';

const APP_VERSION = '1.0.0';

export default function MenuPage() {
  const [resetOpen, setResetOpen] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const resetMutation = useResetAccount();

  const items = [
    { label: t('menu.editProfile'), path: '/menu/perfil', icon: <PersonIcon /> },
    { label: t('menu.dailyBudget'), path: '/menu/previsao-diario', icon: <EventNoteIcon /> },
    { label: t('menu.houses'), path: '/menu/casas', icon: <HomeWorkIcon /> },
    { label: t('menu.tags'), path: '/tags', icon: <LocalOfferIcon /> },
    { label: t('menu.settings'), path: '/menu/configuracoes', icon: <SettingsIcon /> },
  ];

  const placeholderItems = [
    { label: t('menu.suggestions'), icon: <ChatBubbleOutlinedIcon /> },
    { label: t('menu.help'), icon: <HelpOutlinedIcon /> },
    { label: t('menu.terms'), icon: <ArticleOutlinedIcon /> },
    { label: t('menu.privacy'), icon: <ArticleOutlinedIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.name?.charAt(0).toUpperCase() ?? 'U';

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        {t('menu.title')}
      </Typography>

      {/* Profile card */}
      <Paper
        sx={{
          p: 2.5,
          borderRadius: 3,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: '#1B3D6B',
              fontSize: 24,
              fontFamily: '"Fraunces", serif',
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          >
            {initial}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1rem' }} noWrap>
              {user?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary" noWrap>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Main nav items */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <List sx={{ py: 1 }} disablePadding>
          {items.map((item, idx) => (
            <Box key={item.path}>
              <ListItemButton
                sx={{ mx: 1, borderRadius: 2, py: 1.25 }}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { style: { fontWeight: 500 } } }}
                />
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </ListItemButton>
              {idx < items.length - 1 && (
                <Divider sx={{ mx: 2, borderColor: 'divider' }} />
              )}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Secondary items */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 2,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <List sx={{ py: 1 }} disablePadding>
          {placeholderItems.map((item, idx) => (
            <Box key={item.label}>
              <ListItemButton sx={{ mx: 1, borderRadius: 2, py: 1.25 }}>
                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  slotProps={{ primary: { style: { fontWeight: 500 } } }}
                />
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </ListItemButton>
              {idx < placeholderItems.length - 1 && (
                <Divider sx={{ mx: 2, borderColor: 'divider' }} />
              )}
            </Box>
          ))}
        </List>
      </Paper>

      {/* Logout + danger */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 3,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <List sx={{ py: 1 }} disablePadding>
          <ListItemButton sx={{ mx: 1, borderRadius: 2, py: 1.25 }} onClick={handleLogout}>
            <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('menu.logout')}
              slotProps={{ primary: { style: { fontWeight: 500 } } }}
            />
          </ListItemButton>
          <Divider sx={{ mx: 2, borderColor: 'divider' }} />
          <ListItemButton
            sx={{ mx: 1, borderRadius: 2, py: 1.25, color: 'error.main' }}
            onClick={() => setResetOpen(true)}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <DeleteSweepIcon />
            </ListItemIcon>
            <ListItemText
              primary={t('menu.resetAccount')}
              slotProps={{ primary: { style: { fontWeight: 500 } } }}
            />
          </ListItemButton>
        </List>
      </Paper>

      <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5 }}>
        {t('menu.version', { version: APP_VERSION })}
      </Typography>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle sx={{ color: 'error.main', fontWeight: 700 }}>
          {t('menu.resetAccountTitle')}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{t('menu.resetAccountWarning')}</Typography>
          <Typography variant="body2" color="text.secondary">
            {t('menu.resetAccountInfo')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={() => resetMutation.mutate()}
            color="error"
            variant="contained"
            disabled={resetMutation.isPending}
          >
            {t('menu.resetAccount')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
