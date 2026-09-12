import { useState, type ReactNode } from 'react';
import { Box, BottomNavigation, BottomNavigationAction, Paper, useTheme } from '@mui/material';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AssessmentIcon from '@mui/icons-material/Assessment';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
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
    { label: t('appLayout.houses'), path: '/menu/casas', icon: <HomeWorkIcon /> },
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
          pb: 'calc(80px + env(safe-area-inset-bottom, 0px))',
        }}
      >
        {children}
      </Box>

      <Paper
        elevation={0}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: theme.zIndex.appBar,
          borderTop: '1px solid',
          borderColor: 'divider',
          pb: 'env(safe-area-inset-bottom)',
          backdropFilter: 'blur(16px)',
          bgcolor: theme.palette.mode === 'dark'
            ? 'rgba(26,36,56,0.97)'
            : 'rgba(255,255,255,0.97)',
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
          sx={{
            height: 68,
            bgcolor: 'transparent',
          }}
        >
          {tabs.map((item) =>
            item.path === 'add' ? (
              <BottomNavigationAction
                key="add"
                value="add"
                icon={
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      bgcolor: '#4A9FE0',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 20px rgba(74,159,224,0.5)',
                      transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                      '&:active': {
                        transform: 'scale(0.93)',
                        boxShadow: '0 2px 10px rgba(74,159,224,0.4)',
                      },
                    }}
                  >
                    <AddIcon sx={{ fontSize: 28 }} />
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
                sx={{
                  '&.Mui-selected': { color: '#4A9FE0' },
                  color: 'text.secondary',
                  '& .MuiBottomNavigationAction-label': {
                    fontSize: '0.68rem',
                    fontWeight: 500,
                  },
                  '& .MuiBottomNavigationAction-label.Mui-selected': {
                    fontSize: '0.68rem',
                    fontWeight: 600,
                  },
                }}
              />
            ),
          )}
        </BottomNavigation>
      </Paper>

      <AddEntrySheet open={addOpen} onClose={() => setAddOpen(false)} />
    </Box>
  );
}
