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
  CircularProgress,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useWallets, useCreateWallet, useUpdateWallet, useDeleteWallet } from '@/hooks/useWallets';
import type { Wallet, CreateWalletRequest, UpdateWalletRequest } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency, CURRENCIES } from '@/utils/currency';

function WalletFormDialog({
  open,
  onClose,
  wallet,
}: {
  open: boolean;
  onClose: () => void;
  wallet?: Wallet | null;
}) {
  const [name, setName] = useState(wallet?.name ?? '');
  const [description, setDescription] = useState(wallet?.description ?? '');
  const [currency, setCurrency] = useState(wallet?.currency ?? 'BRL');
  const createMutation = useCreateWallet();
  const updateMutation = useUpdateWallet();
  const { t } = useLanguage();

  const isEditing = !!wallet;

  const handleSubmit = () => {
    if (isEditing) {
      const data: UpdateWalletRequest = {
        id: wallet.id,
        name,
        description,
        currency,
      };
      updateMutation.mutate(data, {
        onSuccess: onClose,
      });
    } else {
      const data: CreateWalletRequest = { name, description, currency };
      createMutation.mutate(data, {
        onSuccess: onClose,
      });
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCurrency('BRL');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? t.wallet.editWallet : t.wallet.newWallet}</DialogTitle>
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
          label={t.wallet.description}
          margin="normal"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>{t.wallet.currency}</InputLabel>
          <Select
            value={currency}
            label={t.wallet.currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            {CURRENCIES.map((c) => (
              <MenuItem key={c.code} value={c.code}>
                {c.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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

interface WalletCardProps {
  wallet: Wallet;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
}

function WalletCard({ wallet, onEdit, onDelete, onClick }: WalletCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {wallet.name}
            </Typography>
            {wallet.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {wallet.description}
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
          <Typography variant="caption" color="text.secondary">
            {t.wallet.currentBalance}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary.main">
            {formatCurrency(wallet.balance, wallet.currency)}
          </Typography>
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

export default function WalletListPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: wallets, isLoading } = useWallets();
  const deleteMutation = useDeleteWallet();

  const handleEdit = (wallet: Wallet) => {
    setEditingWallet(wallet);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingWallet(null);
    setDialogOpen(true);
  };

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
          {t.wallet.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreate}
        >
          {t.wallet.newWallet}
        </Button>
      </Box>

      <Grid container spacing={3}>
        {wallets?.map((wallet) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={wallet.id}>
            <WalletCard
              wallet={wallet}
              onEdit={() => handleEdit(wallet)}
              onDelete={() => setDeleteConfirm(wallet.id)}
              onClick={() => navigate(`/wallets/${wallet.id}`)}
            />
          </Grid>
        ))}
        {wallets?.length === 0 && (
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
                Você ainda não criou nenhuma carteira
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Crie sua primeira carteira para começar a organizar seu dinheiro.
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreate}>
                {t.wallet.newWallet}
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>

      <WalletFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingWallet(null);
        }}
        wallet={editingWallet}
      />

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t.wallet.deleteWallet}</DialogTitle>
        <DialogContent>
          <Typography>
            {t.wallet.deleteWalletMsg}
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
