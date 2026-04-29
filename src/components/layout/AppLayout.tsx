import { useState, type ReactNode } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import HomeIcon from '@mui/icons-material/Home';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import LogoutIcon from '@mui/icons-material/Logout';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import LanguageIcon from '@mui/icons-material/Language';
import SettingsIcon from '@mui/icons-material/Settings';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import CategoryIcon from '@mui/icons-material/Category';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLogout } from '@/hooks/useAuth';
import { useLanguage } from '@/i18n/LanguageContext';
import { useThemeContext } from '@/theme/ThemeContext';

const DRAWER_WIDTH = 260;
const COLLAPSED_WIDTH = 72;

export default function AppLayout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const logoutMutation = useLogout();
  const { t, locale, setLocale } = useLanguage();
  const { mode, toggleTheme } = useThemeContext();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const navItems = [
    { label: t.nav.dashboard, path: '/', icon: <DashboardIcon /> },
    { label: t.nav.wallets, path: '/wallets', icon: <AccountBalanceWalletIcon /> },
    { label: t.nav.entries, path: '/entries', icon: <ReceiptLongIcon /> },
    { label: t.nav.homes, path: '/homes', icon: <HomeIcon /> },
    { label: t.nav.salaries, path: '/salaries', icon: <AutorenewIcon /> },
    { label: t.common.categories, path: '/categories', icon: <CategoryIcon /> },
    { label: t.nav.reports, path: '/reports', icon: <AssessmentIcon /> },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logoutMutation.mutate();
  };

  const toggleLanguage = () => {
    setLocale(locale === 'pt' ? 'en' : 'pt');
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Toolbar
        sx={{
          px: 2,
          minHeight: '64px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
        }}
      >
        {!collapsed && !isMobile && (
          <Typography
            variant="h6"
            sx={{ fontWeight: 700, color: 'primary.main' }}
            noWrap
          >
            Zeno
          </Typography>
        )}
        {!isMobile && (
          <IconButton
            onClick={() => setCollapsed(!collapsed)}
            size="small"
            sx={{ color: 'text.secondary' }}
          >
            <ChevronLeftIcon
              sx={{
                transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.2s',
              }}
            />
          </IconButton>
        )}
      </Toolbar>
      <Divider sx={{ borderColor: 'divider' }} />
      <List sx={{ flex: 1, pt: 2, px: collapsed && !isMobile ? 1 : 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.path}
              title={collapsed && !isMobile ? item.label : ''}
              placement="right"
            >
              <ListItemButton
                selected={active}
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  mx: collapsed && !isMobile ? 0 : 1,
                  mb: 0.5,
                  borderRadius: 2,
                  minHeight: 48,
                  justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                  px: collapsed && !isMobile ? 1 : 2,
                  bgcolor: active ? 'primary.main' : 'transparent',
                  color: active ? 'primary.contrastText' : 'text.secondary',
                  '&:hover': {
                    bgcolor: active ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed && !isMobile ? 'auto' : 40,
                    color: active ? 'inherit' : 'text.secondary',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && !isMobile && (
                  <ListItemText
                    primary={item.label}
                    sx={{
                      '& .MuiTypography-root': {
                        fontSize: '0.9rem',
                        fontWeight: active ? 600 : 400,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'divider' }} />
      <Box
        sx={{
          p: collapsed && !isMobile ? 1 : 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: 1.5,
            borderRadius: 2,
            bgcolor: 'background.default',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: 14,
            }}
          >
            {user?.name?.charAt(0).toUpperCase() ?? 'U'}
          </Avatar>
          {!collapsed && !isMobile && (
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}
                noWrap
              >
                {user?.name}
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                noWrap
              >
                {user?.email}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          ml: { md: `${collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH}px` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          transition: 'width 0.2s',
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
          >
            <MenuIcon />
          </IconButton>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title={t.nav.language}>
            <IconButton
              onClick={toggleLanguage}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <LanguageIcon fontSize="small" />
              <Typography
                variant="caption"
                sx={{ ml: 0.5, fontSize: 11, display: { xs: 'none', sm: 'inline' } }}
              >
                {locale.toUpperCase()}
              </Typography>
            </IconButton>
          </Tooltip>
          <Tooltip title={mode === 'dark' ? t.nav.lightMode : t.nav.darkMode}>
            <IconButton
              onClick={toggleTheme}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              {mode === 'dark' ? (
                <LightModeIcon fontSize="small" />
              ) : (
                <DarkModeIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleMenuOpen} size="small" sx={{ ml: 0.5 }}>
            <SettingsIcon fontSize="small" sx={{ color: 'text.secondary' }} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            slotProps={{
              paper: {
                sx: { minWidth: 200, mt: 1 },
              },
            }}
          >
            <MenuItem disabled>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {user?.name}
              </Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={toggleLanguage}>
              <ListItemIcon>
                <LanguageIcon fontSize="small" />
              </ListItemIcon>
              {t.nav.language}
            </MenuItem>
            <MenuItem onClick={toggleTheme}>
              <ListItemIcon>
                {mode === 'dark' ? (
                  <LightModeIcon fontSize="small" />
                ) : (
                  <DarkModeIcon fontSize="small" />
                )}
              </ListItemIcon>
              {mode === 'dark' ? t.nav.lightMode : t.nav.darkMode}
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
              </ListItemIcon>
              {t.nav.logout}
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { md: collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH },
          flexShrink: { md: 0 },
          transition: 'width 0.2s',
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
            },
          }}
        >
          {drawerContent}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH,
              transition: 'width 0.2s',
              borderRight: '1px solid',
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${collapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
          bgcolor: 'background.default',
          minHeight: '100vh',
          transition: 'width 0.2s',
        }}
      >
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 } }}>{children}</Box>
      </Box>
    </Box>
  );
}
