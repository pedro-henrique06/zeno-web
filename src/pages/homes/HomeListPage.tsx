import { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
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
import MoreVertIcon from '@mui/icons-material/MoreVert';
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

interface HomeCardProps {
  home: Home;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

function HomeCard({ home, onEdit, onDelete, onClick }: HomeCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Card
      sx={{
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        position: 'relative',
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {home.name}
            </Typography>
            {home.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {home.description}
              </Typography>
            )}
          </Box>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen(!menuOpen);
            }}
          >
            <MoreVertIcon />
          </IconButton>
          {menuOpen && (
            <Box
              sx={{
                position: 'absolute',
                top: 40,
                right: 8,
                bgcolor: 'background.paper',
                borderRadius: 2,
                boxShadow: 3,
                zIndex: 10,
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => { onEdit(); setMenuOpen(false); }}
              >
                <EditIcon fontSize="small" />
                <Typography variant="body2">{t.common.edit}</Typography>
              </Box>
              <Box
                sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, cursor: 'pointer', color: 'error.main', '&:hover': { bgcolor: 'action.hover' } }}
                onClick={() => { onDelete(); setMenuOpen(false); }}
              >
                <DeleteIcon fontSize="small" />
                <Typography variant="body2">{t.common.delete}</Typography>
              </Box>
            </Box>
          )}
        </Box>
        <Box sx={{ mt: 2 }}>
          <Chip
            label={SplitModeLabels[home.splitMode]}
            size="small"
            variant="outlined"
          />
        </Box>
        <Button
          fullWidth
          variant="outlined"
          size="small"
          sx={{ mt: 2 }}
          onClick={(e) => { e.stopPropagation(); onClick(); }}
        >
          {t.common.viewDetails}
        </Button>
      </CardContent>
    </Card>
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

      <Grid container spacing={3}>
        {homes?.map((home) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={home.id}>
            <HomeCard
              home={home}
              onEdit={() => { setEditingHome(home); setDialogOpen(true); }}
              onDelete={() => setDeleteConfirm(home.id)}
              onClick={() => navigate(`/homes/${home.id}`)}
            />
          </Grid>
        ))}
        {homes?.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Box
              sx={{
                textAlign: 'center',
                py: 6,
                px: 3,
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: '1px dashed',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" sx={{ mb: 1 }}>
                {t.home.noHomes}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crie uma casa para compartilhar despesas com sua família.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingHome(null); setDialogOpen(true); }}
              >
                {t.home.newHome}
              </Button>
            </Box>
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
}
