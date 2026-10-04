import { useEffect, useState, type ReactNode } from 'react';
import dayjs from 'dayjs';
import {
  Alert,
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
  Snackbar,
  Switch,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
import { alpha } from '@mui/material/styles';
import { brand } from '@/theme/tokens';

const ROW_SX = { mx: 1, borderRadius: 2, py: 1.25 } as const;

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Typography
      sx={{ fontSize: '11px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'text.secondary', mt: 2.5, mb: 0.75, pl: 0.5 }}
    >
      {children}
    </Typography>
  );
}

function SectionCard({ children }: { children: ReactNode }) {
  return (
    <Paper sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', py: 0.5 }}>
      <List disablePadding>{children}</List>
    </Paper>
  );
}

function IconBadge({ children, danger }: { children: ReactNode; danger?: boolean }) {
  return (
    <ListItemIcon sx={{ minWidth: 46 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: danger ? alpha(brand.expense, 0.12) : brand.navy,
          color: danger ? brand.expense : brand.blue,
          '& svg': { fontSize: 18 },
        }}
      >
        {children}
      </Box>
    </ListItemIcon>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { mode, toggleTheme } = useThemeContext();
  const logoutMutation = useLogout();
  const { subscribed, loading, error: pushError, isSupported, permission, subscribe, unsubscribe } = usePushNotification();
  const { data: profile } = useProfile();

  const today = dayjs();
  const { data: balancesData, isLoading: balancesLoading } = useBalances(today.month() + 1, today.year());
  const createEntry = useCreateEntry();

  const [resetOpen, setResetOpen] = useState(false);
  const [pushErrorMsg, setPushErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (pushError) setPushErrorMsg(pushError);
  }, [pushError]);

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

      <SectionLabel>{t('settings.sectionAppearance')}</SectionLabel>
      <SectionCard>
        <ListItemButton onClick={toggleTheme} sx={ROW_SX}>
          <IconBadge>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</IconBadge>
          <ListItemText primary={mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')} slotProps={{ primary: { style: { fontWeight: 500 } } }} />
          <Switch checked={mode === 'dark'} onChange={toggleTheme} onClick={(e) => e.stopPropagation()} />
        </ListItemButton>
      </SectionCard>

      {isSupported && permission !== 'denied' && (
        <>
          <SectionLabel>{t('settings.sectionNotifications')}</SectionLabel>
          <SectionCard>
            <ListItemButton onClick={handleNotificationToggle} disabled={loading} sx={ROW_SX}>
              <IconBadge>{subscribed ? <NotificationsIcon /> : <NotificationsOffIcon />}</IconBadge>
              <ListItemText
                primary={t('settings.notifications')}
                secondary={subscribed ? t('settings.notificationsOn') : t('settings.notificationsOff')}
                slotProps={{ primary: { style: { fontWeight: 500 } } }}
              />
              <Switch checked={subscribed} disabled={loading} onChange={handleNotificationToggle} onClick={(e) => e.stopPropagation()} />
            </ListItemButton>
          </SectionCard>
        </>
      )}

      <SectionLabel>{t('settings.sectionAccount')}</SectionLabel>
      <SectionCard>
        <ListItemButton onClick={() => setResetOpen(true)} disabled={balancesLoading} sx={ROW_SX}>
          <IconBadge>{balancesLoading ? <CircularProgress size={18} color="inherit" /> : <AccountBalanceWalletIcon />}</IconBadge>
          <ListItemText
            primary={t('settings.resetBalance')}
            secondary={
              balancesLoading
                ? t('settings.resetBalanceLoading')
                : t('settings.resetBalanceCurrent', { balance: formatBalance(todayBalance) })
            }
            slotProps={{ primary: { style: { fontWeight: 500 } } }}
          />
          <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
        </ListItemButton>
        <Divider sx={{ mx: 2 }} />
        <ListItemButton onClick={() => logoutMutation.mutate()} sx={ROW_SX}>
          <IconBadge danger><LogoutIcon /></IconBadge>
          <ListItemText primary={t('settings.logout')} slotProps={{ primary: { style: { fontWeight: 500, color: brand.expense } } }} />
        </ListItemButton>
      </SectionCard>

      <Snackbar
        open={!!pushErrorMsg}
        autoHideDuration={5000}
        onClose={() => setPushErrorMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" variant="filled" onClose={() => setPushErrorMsg(null)} sx={{ width: '100%' }}>
          {pushErrorMsg}
        </Alert>
      </Snackbar>

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
