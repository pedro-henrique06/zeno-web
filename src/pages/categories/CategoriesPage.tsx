import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  TextField,
  InputAdornment,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { useTags, useCreateTag, useUpdateTag, useDeleteTag } from '@/hooks/useTags';
import type { Tag } from '@/types';

export default function CategoriesPage() {
  const { data: tags, isLoading, isError } = useTags();
  const createMutation = useCreateTag();
  const updateMutation = useUpdateTag();
  const deleteMutation = useDeleteTag();

  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [name, setName] = useState('');

  const filtered = (tags ?? []).filter((tag) =>
    tag.name.toLowerCase().includes(search.toLowerCase()),
  );

  const openCreate = () => {
    setEditingTag(null);
    setName('');
    setDialogOpen(true);
  };

  const openEdit = (tag: Tag) => {
    setEditingTag(tag);
    setName(tag.name);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    if (editingTag) {
      updateMutation.mutate({ id: editingTag.id, name }, { onSuccess: () => setDialogOpen(false) });
    } else {
      createMutation.mutate({ name }, { onSuccess: () => setDialogOpen(false) });
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
        <Typography color="error">Não foi possível carregar as tags. Tente novamente.</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Buscar tags"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <IconButton onClick={openCreate} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <AddIcon />
        </IconButton>
      </Box>

      {filtered.length > 0 ? (
        <Paper sx={{ borderRadius: 3 }}>
          <List>
            {filtered.map((tag) => (
              <ListItem
                key={tag.id}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => openEdit(tag)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => deleteMutation.mutate(tag.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                }
              >
                <ListItemText primary={tag.name} />
              </ListItem>
            ))}
          </List>
        </Paper>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.secondary' }}>
          <LocalOfferIcon sx={{ fontSize: 64, mb: 2, opacity: 0.4 }} />
          <Typography variant="h6">Sem tags por aqui...</Typography>
          <Typography variant="body2">Crie uma tag para organizar seus lançamentos.</Typography>
        </Box>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTag ? 'Editar tag' : 'Nova tag'}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nome"
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={!name.trim() || createMutation.isPending || updateMutation.isPending}
          >
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
