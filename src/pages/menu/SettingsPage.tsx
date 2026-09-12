import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from '@/theme/ThemeContext';
import { useLogout } from '@/hooks/useAuth';
import { usePushNotification } from '@/hooks/usePushNotification';
import { useBalances } from '@/hooks/useBalances';
import { useCreateEntry } from '@/hooks/useEntries';
import { useProfile } from '@/hooks/useUser';
import { EntryKind } from '@/types';
import { CURRENCY_SYMBOLS } from '@/utils/currency';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const logoutMutation = useLogout();
  const { subscribed, loading, isSupported, permission, subscribe, unsubscribe } = usePushNotification();
  const { data: profile } = useProfile();

  const today = dayjs();
  const { data: balancesData, isLoading: balancesLoading } = useBalances(today.month() + 1, today.year());
  const createEntry = useCreateEntry();

  const [resetOpen, setResetOpen] = useState(false);

  const todayBalance = balancesData?.days.find((d) => d.isToday)?.balance ?? 0;
  const currencySymbol = CURRENCY_SYMBOLS[profile?.currency ?? 'BRL'];

  const formatBalance = (value: number) =>
    `${currencySymbol} ${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const handleNotificationToggle = () => {
    if (subscribed) {
      unsubscribe();
    } else {
      subscribe();
    }
  };

  const handleResetBalance = () => {
    if (todayBalance === 0) {
      setResetOpen(false);
      return;
    }

    const isPositive = todayBalance > 0;
    createEntry.mutate(
      {
        title: t('settings.balanceResetEntryTitle'),
        value: Math.abs(todayBalance),
        kind: isPositive ? EntryKind.Saida : EntryKind.Entrada,
        description: t('settings.balanceResetEntryDesc'),
        tagId: null,
        date: today.format('YYYY-MM-DD'),
        isRecurring: false,
        recurrenceEndDate: null,
      },
      {
        onSuccess: () => setResetOpen(false),
      }
    );
  };

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
            <Switch checked={mode === 'dark'} onChange={toggleTheme} onClick={(e) => e.stopPropagation()} />
          </ListItemButton>

          {isSupported && permission !== 'denied' && (
            <ListItemButton
              onClick={handleNotificationToggle}
              disabled={loading}
              sx={{ mx: 1, borderRadius: 2 }}
            >
              <ListItemIcon>
                {subscribed ? <NotificationsIcon /> : <NotificationsOffIcon />}
              </ListItemIcon>
              <ListItemText
                primary={t('settings.notifications')}
                secondary={subscribed ? t('settings.notificationsOn') : t('settings.notificationsOff')}
              />
              <Switch checked={subscribed} disabled={loading} />
            </ListItemButton>
          )}

          <Divider sx={{ my: 1 }} />

          <ListItemButton
            onClick={() => setResetOpen(true)}
            disabled={balancesLoading}
            sx={{ mx: 1, borderRadius: 2 }}
          >
            <ListItemIcon>
              {balancesLoading ? <CircularProgress size={20} /> : <AccountBalanceWalletIcon />}
            </ListItemIcon>
            <ListItemText
              primary={t('settings.resetBalance')}
              secondary={
                balancesLoading
                  ? t('settings.resetBalanceLoading')
                  : t('settings.resetBalanceCurrent', { balance: formatBalance(todayBalance) })
              }
            />
          </ListItemButton>

          <Divider sx={{ my: 1 }} />

          <ListItemButton onClick={() => logoutMutation.mutate()} sx={{ mx: 1, borderRadius: 2, color: 'error.main' }}>
            <ListItemIcon sx={{ color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('settings.logout')} />
          </ListItemButton>
        </List>
      </Paper>

      <Dialog open={resetOpen} onClose={() => setResetOpen(false)}>
        <DialogTitle>{t('settings.resetBalanceTitle')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {todayBalance === 0
              ? t('settings.resetBalanceAlreadyZero')
              : t('settings.resetBalanceConfirm', {
                  balance: formatBalance(todayBalance),
                  sign: todayBalance > 0 ? '+' : '-',
                })}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetOpen(false)}>{t('common.cancel')}</Button>
          {todayBalance !== 0 && (
            <Button
              variant="contained"
              disabled={createEntry.isPending}
              onClick={handleResetBalance}
            >
              {t('settings.resetBalanceConfirmBtn')}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
