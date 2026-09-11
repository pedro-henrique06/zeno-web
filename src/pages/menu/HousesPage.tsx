import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HomeWorkIcon from '@mui/icons-material/HomeWork';
import RepeatIcon from '@mui/icons-material/Repeat';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useNavigate } from 'react-router-dom';
import { useHouses, useCreateHouse, useUpdateHouse, useDeleteHouse, useHouseEntries } from '@/hooks/useHouses';
import { useProfile } from '@/hooks/useUser';
import { useEntryKindLabels } from '@/utils/entryKind';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import type { House } from '@/types';

function HouseEntriesDialog({ house, open, onClose }: { house: House; open: boolean; onClose: () => void }) {
  const { t } = useTranslation();
  const kindLabels = useEntryKindLabels();
  const { data: profile } = useProfile();
  const { data: entries, isLoading } = useHouseEntries(open ? house.id : null);

  const currencySymbol = CURRENCY_SYMBOLS[profile?.currency ?? 'BRL'];
  const locale = LANGUAGE_LOCALES[profile?.language ?? 'PtBR'];

  const formatValue = (value: number) =>
    `${currencySymbol} ${value.toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <HomeWorkIcon fontSize="small" />
        {house.name}
      </DialogTitle>
      <DialogContent sx={{ px: 0 }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : !entries || entries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 5, color: 'text.secondary', px: 3 }}>
            <RepeatIcon sx={{ fontSize: 48, mb: 1, opacity: 0.4 }} />
            <Typography variant="body1">{t('houses.noEntries')}</Typography>
            <Typography variant="body2">{t('houses.noEntriesHint')}</Typography>
          </Box>
        ) : (
          <List disablePadding>
            {entries.map((entry, i) => (
              <Box key={entry.id}>
                {i > 0 && <Divider />}
                <ListItem sx={{ px: 3 }}>
                  <ListItemText
                    primary={entry.title}
                    secondary={kindLabels[entry.kind]}
                  />
                  <Chip
                    label={formatValue(entry.value)}
                    size="small"
                    variant="outlined"
                    sx={{ ml: 1 }}
                  />
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('common.cancel')}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HousesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: houses, isLoading, isError } = useHouses();
  const createMutation = useCreateHouse();
  const updateMutation = useUpdateHouse();
  const deleteMutation = useDeleteHouse();

  const [formOpen, setFormOpen] = useState(false);
  const [editingHouse, setEditingHouse] = useState<House | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const [detailHouse, setDetailHouse] = useState<House | null>(null);

  const openCreate = () => {
    setEditingHouse(null);
    setName('');
    setDescription('');
    setFormOpen(true);
  };

  const openEdit = (e: React.MouseEvent, house: House) => {
    e.stopPropagation();
    setEditingHouse(house);
    setName(house.name);
    setDescription(house.description ?? '');
    setFormOpen(true);
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteMutation.mutate(id);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingHouse) {
      updateMutation.mutate(
        { id: editingHouse.id, name, description: description || undefined },
        { onSuccess: () => setFormOpen(false) },
      );
    } else {
      createMutation.mutate(
        { name, description: description || undefined },
        { onSuccess: () => setFormOpen(false) },
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
          <List disablePadding>
            {(houses ?? []).map((house, i) => (
              <Box key={house.id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  sx={{ px: 2, py: 1.5 }}
                  onClick={() => setDetailHouse(house)}
                >
                  <ListItemText
                    primary={house.name}
                    secondary={house.description || undefined}
                  />
                  <ListItemSecondaryAction>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <IconButton size="small" onClick={(e) => openEdit(e, house)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={(e) => handleDelete(e, house.id)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      <ChevronRightIcon fontSize="small" sx={{ color: 'text.secondary', ml: 0.5 }} />
                    </Box>
                  </ListItemSecondaryAction>
                </ListItemButton>
              </Box>
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

      {/* Dialog: formulário de criação/edição */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
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
          <Button onClick={() => setFormOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
          >
            {t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog: lançamentos recorrentes da casa */}
      {detailHouse && (
        <HouseEntriesDialog
          house={detailHouse}
          open={!!detailHouse}
          onClose={() => setDetailHouse(null)}
        />
      )}
    </Box>
  );
}
