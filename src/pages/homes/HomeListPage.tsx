import { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import {
  useHomes,
  useCreateHome,
  useUpdateHome,
  useDeleteHome,
} from '@/hooks/useHomes';
import type { Home, CreateHomeRequest, UpdateHomeRequest, SplitMode } from '@/types';
import { SplitMode as SplitModeEnum, SplitModeLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

function HomeFormDialog({
  open,
  onClose,
  home,
}: {
  open: boolean;
  onClose: () => void;
  home?: Home | null;
}) {
  const [name, setName] = useState(home?.name ?? '');
  const [description, setDescription] = useState(home?.description ?? '');
  const [splitMode, setSplitMode] = useState<SplitMode>(
    home?.splitMode ?? SplitModeEnum.ByTotalBalance,
  );

  const createMutation = useCreateHome();
  const updateMutation = useUpdateHome();
  const isEditing = !!home;
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (isEditing && home) {
      const data: UpdateHomeRequest = {
        id: home.id,
        name,
        description,
        splitMode,
      };
      updateMutation.mutate(data, { onSuccess: onClose });
    } else {
      const data: CreateHomeRequest = { name, description, splitMode };
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setSplitMode(SplitModeEnum.ByTotalBalance);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? t.home.editHome : t.home.newHome}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t.wallet.name}
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          fullWidth
          label={t.common.description}
          margin="normal"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          fullWidth
          select
          label={t.home.splitMode}
          margin="normal"
          value={splitMode}
          onChange={(e) => setSplitMode(Number(e.target.value) as SplitMode)}
        >
          {Object.entries(SplitModeLabels).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t.common.cancel}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || createMutation.isPending || updateMutation.isPending}
        >
          {isEditing ? t.common.save : t.common.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function HomeListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingHome, setEditingHome] = useState<Home | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: homes, isLoading } = useHomes();
  const deleteMutation = useDeleteHome();

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id, {
      onSuccess: () => setDeleteConfirm(null),
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t.home.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingHome(null);
            setDialogOpen(true);
          }}
        >
          {t.home.newHome}
        </Button>
      </Box>

      <Grid container spacing={2}>
        {homes?.map((home) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={home.id}>
            <Card
              sx={{ cursor: 'pointer', '&:hover': { opacity: 0.9 } }}
              onClick={() => navigate(`/homes/${home.id}`)}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {home.name}
                </Typography>
                {home.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {home.description}
                  </Typography>
                )}
                <Chip
                  label={SplitModeLabels[home.splitMode]}
                  size="small"
                  variant="outlined"
                />
              </CardContent>
              <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                <IconButton size="small" onClick={(e) => { e.stopPropagation(); handleEdit(home); }}>
                  <EditIcon />
                </IconButton>
                <IconButton
                  size="small"
                  color="error"
                  onClick={(e) => { e.stopPropagation(); setDeleteConfirm(home.id); }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
        {homes?.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Typography color="text.secondary" align="center" sx={{ mt: 4 }}>
              {t.home.noHomes}
            </Typography>
          </Grid>
        )}
      </Grid>

      <HomeFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingHome(null);
        }}
        home={editingHome}
      />

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t.home.deleteHome}</DialogTitle>
        <DialogContent>
          <Typography>
            {t.home.deleteHomeMsg}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t.common.cancel}</Button>
          <Button
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
          >
            {t.common.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );

  function handleEdit(home: Home) {
    setEditingHome(home);
    setDialogOpen(true);
  }
}
