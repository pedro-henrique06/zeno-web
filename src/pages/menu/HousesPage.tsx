import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import { useNavigate } from 'react-router-dom';
import { useHouses, useCreateHouse, useUpdateHouse, useDeleteHouse } from '@/hooks/useHouses';
import type { House } from '@/types';

export default function HousesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: houses, isLoading, isError } = useHouses();
  const createMutation = useCreateHouse();
  const updateMutation = useUpdateHouse();
  const deleteMutation = useDeleteHouse();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreate = () => {
    setEditingHouse(null);
    setName('');
    setDescription('');
    setDialogOpen(true);
  };

  const openEdit = (house: House) => {
    setEditingHouse(house);
    setName(house.name);
    setDescription(house.description ?? '');
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingHouse) {
      updateMutation.mutate(
        { id: editingHouse.id, name, description: description || undefined },
        { onSuccess: () => setDialogOpen(false) },
      );
    } else {
      createMutation.mutate(
        { name, description: description || undefined },
        { onSuccess: () => setDialogOpen(false) },
      );
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">{t('houses.loadError')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate('/menu')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>
          {t('houses.title')}
        </Typography>
        <IconButton onClick={openCreate} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <AddIcon />
        </IconButton>
      </Box>

      {(houses ?? []).length > 0 ? (
        <Paper sx={{ borderRadius: 3 }}>
          <List>
            {(houses ?? []).map((house) => (
              <ListItem key={house.id}>
                <ListItemText
                  primary={house.name}
                  secondary={house.description || undefined}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEdit(house)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(house.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <HomeWorkIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">{t('houses.emptyTitle')}</Typography>
          <Typography variant="body2">{t('houses.emptySubtitle')}</Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingHouse ? t('houses.editTitle') : t('houses.newTitle')}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label={t('houses.name')}
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <TextField
            fullWidth
            label={t('houses.description')}
            margin="normal"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={2}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
