import { useState, type ReactNode } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, useTheme } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AddEntrySheet } from '@/components/AddEntrySheet';

export default function AppLayout({ children }: { children: ReactNode }) {
  const [addOpen, setAddOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const { t } = useTranslation();

  const tabs = [
    { label: t('appLayout.balances'), path: '/', icon: <AccountBalanceIcon /> },
    { label: t('appLayout.totals'), path: '/totais', icon: <AssessmentIcon /> },
    { label: '', path: 'add', icon: <AddIcon /> },
    { label: t('appLayout.tags'), path: '/tags', icon: <LocalOfferIcon /> },
    { label: t('appLayout.menu'), path: '/menu', icon: <MenuIcon /> },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const activeTab = tabs.find((item) => item.path !== 'add' && isActive(item.path));
  const bottomNavValue = activeTab?.path ?? '';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          p: 2,
          pt: 'calc(16px + env(safe-area-inset-top, 0px))',
          pb: 'calc(72px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </Box>

      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderTop: '1px solid',
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
        }}
      >
        <BottomNavigation
          showLabels
          value={bottomNavValue}
          onChange={(_, newValue) => {
            if (newValue === 'add') {
              setAddOpen(true);
            } else {
              navigate(newValue);
            }
          }}
          sx={{ height: 64 }}
        >
          {tabs.map((item) =>
            item.path === 'add' ? (
              <BottomNavigationAction
                key="add"
                value="add"
                icon={
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: 'text.primary',
                      color: 'background.paper',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.icon}
                  </Box>
                }
                sx={{ minWidth: 'auto' }}
              />
            ) : (
              <BottomNavigationAction
                key={item.path}
                label={item.label}
                value={item.path}
                icon={item.icon}
              />
            ),
          )}
        </BottomNavigation>
      </Paper>

      <AddEntrySheet open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
