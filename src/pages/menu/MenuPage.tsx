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
import { useProfile } from '@/hooks/useUser';
import { useSummary } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';
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
  const { data: profile } = useProfile();
  const now = new Date();
  const { data: summary } = useSummary(now.getMonth() + 1, now.getFullYear());

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

  const nameParts = (user?.name ?? '').trim().split(/\s+/);
  const initial =
    nameParts.length >= 2
      ? (nameParts[0].charAt(0) + nameParts[1].charAt(0)).toUpperCase()
      : (nameParts[0]?.charAt(0) ?? 'U').toUpperCase();

  return (
    <Box>
      {/* Profile — avatar + ghost name (no card) */}
      <Box sx={{ mb: 2 }}>
        <Avatar
          sx={{
            width: 52,
            height: 52,
            bgcolor: '#4A9FE0',
            fontSize: 18,
            fontWeight: 700,
            mb: 1,
          }}
        >
          {initial}
        </Avatar>
        <Typography sx={{
          fontFamily: '"Fraunces", serif',
          fontWeight: 300,
          fontStyle: 'italic',
          fontSize: '1.2rem',
          color: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
          lineHeight: 1.1,
          mb: 0.25,
        }} noWrap>
          {user?.name}
        </Typography>
        <Typography sx={{ fontSize: '11px', color: 'text.secondary' }} noWrap>
          {user?.email}
        </Typography>
      </Box>

      {/* Daily budget card — dark */}
      {profile?.dailyBudget != null && profile.dailyBudget > 0 && (
        <Paper
          sx={{
            p: 2,
            borderRadius: 3,
            mb: 1.5,
            bgcolor: '#1B2D48',
            boxShadow: 'none',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={() => navigate('/menu/previsao-diario')}
        >
          <Typography sx={{ fontSize: '9.5px', fontWeight: 700, letterSpacing: '.6px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', mb: 0.75 }}>
            {t('menu.dailyBudget')}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1 }}>
            <Typography sx={{
              fontFamily: '"Fraunces", serif',
              fontSize: '1.3rem',
              fontWeight: 600,
              color: '#FFFFFF',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCurrency(profile.dailyBudget, profile.currency, profile.language)}
              <span style={{ fontSize: '0.85rem', opacity: 0.45, marginLeft: 2 }}>/dia</span>
            </Typography>
            {summary && (
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#2DC579' }}>
                {Math.round((summary.movements.diario / Math.max(profile.dailyBudget, 1)) * 100)}% usado hoje
              </Typography>
            )}
          </Box>
          <Box sx={{ height: 5, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.12)', overflow: 'hidden' }}>
            {summary && (
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.min(Math.round((summary.movements.diario / Math.max(profile.dailyBudget, 1)) * 100), 100)}%`,
                  background: 'linear-gradient(90deg, #2DC579, #5ECCC8)',
                  borderRadius: 3,
                  transition: 'width 0.4s ease',
                }}
              />
            )}
          </Box>
        </Paper>
      )}

      {/* Main nav items */}
      <Paper
        sx={{
          borderRadius: 3,
          mb: 1.5,
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
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Box sx={{
                    width: 34, height: 34,
                    borderRadius: '10px',
                    bgcolor: '#1B2D48',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#4A9FE0',
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
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
          mb: 1.5,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: 'none',
        }}
      >
        <List sx={{ py: 1 }} disablePadding>
          {placeholderItems.map((item, idx) => (
            <Box key={item.label}>
              <ListItemButton sx={{ mx: 1, borderRadius: 2, py: 1.25 }}>
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Box sx={{
                    width: 34, height: 34,
                    borderRadius: '10px',
                    bgcolor: 'action.hover',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'text.secondary',
                  }}>
                    {item.icon}
                  </Box>
                </ListItemIcon>
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
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'rgba(232,107,82,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E86B52' }}>
                <LogoutIcon sx={{ fontSize: 18 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={t('menu.logout')}
              slotProps={{ primary: { style: { fontWeight: 500, color: '#E86B52' } } }}
            />
          </ListItemButton>
          <Divider sx={{ mx: 2, borderColor: 'divider' }} />
          <ListItemButton
            sx={{ mx: 1, borderRadius: 2, py: 1.25 }}
            onClick={() => setResetOpen(true)}
          >
            <ListItemIcon sx={{ minWidth: 44 }}>
              <Box sx={{ width: 34, height: 34, borderRadius: '10px', bgcolor: 'rgba(232,107,82,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#E86B52' }}>
                <DeleteSweepIcon sx={{ fontSize: 18 }} />
              </Box>
            </ListItemIcon>
            <ListItemText
              primary={t('menu.resetAccount')}
              slotProps={{ primary: { style: { fontWeight: 500, color: '#E86B52' } } }}
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
