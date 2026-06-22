import { Avatar, Box, List, ListItemButton, ListItemIcon, ListItemText, Paper, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import EventNoteIcon from '@mui/icons-material/EventNote';
import SettingsIcon from '@mui/icons-material/Settings';
import ChatBubbleOutlinedIcon from '@mui/icons-material/ChatBubbleOutlined';
import HelpOutlinedIcon from '@mui/icons-material/HelpOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const APP_VERSION = '1.0.0';

export default function MenuPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const items = [
    { label: 'Editar perfil', path: '/menu/perfil', icon: <PersonIcon /> },
    { label: 'Previsão de diário', path: '/menu/previsao-diario', icon: <EventNoteIcon /> },
    { label: 'Configurações', path: '/menu/configuracoes', icon: <SettingsIcon /> },
  ];

  const placeholderItems = [
    { label: 'Mandar sugestões', icon: <ChatBubbleOutlinedIcon /> },
    { label: 'Ajuda', icon: <HelpOutlinedIcon /> },
    { label: 'Termos de uso', icon: <ArticleOutlinedIcon /> },
    { label: 'Política de privacidade', icon: <ArticleOutlinedIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>
        Menu
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
          {items.map((item) => (
            <ListItemButton key={item.path} sx={{ mx: 1, borderRadius: 2 }} onClick={() => navigate(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemButton>
          ))}
          {placeholderItems.map((item) => (
            <ListItemButton key={item.label} sx={{ mx: 1, borderRadius: 2 }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
              <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
            </ListItemButton>
          ))}
          <ListItemButton sx={{ mx: 1, borderRadius: 2 }} onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Sair" />
          </ListItemButton>
        </List>
      </Paper>

      <Typography variant="caption" color="text.secondary" sx={{ pl: 0.5 }}>
        Versão {APP_VERSION}
      </Typography>
    </Box>
  );
}
