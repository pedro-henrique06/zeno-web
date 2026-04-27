import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Typography,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallets';
import { useEntries, useCreateEntry, useUpdateEntry, useDeleteEntry } from '@/hooks/useEntries';
import type { Entry, CreateEntryRequest, UpdateEntryRequest } from '@/types';
import { EntryType, Category, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';

const entryTypeColors: Record<EntryType, 'success' | 'error'> = {
  [EntryType.Credit]: 'success',
  [EntryType.Debit]: 'error',
};

interface EntryFormData {
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
}

function EntryFormDialog({
  open,
  onClose,
  walletId,
  entry,
}: {
  open: boolean;
  onClose: () => void;
  walletId: string;
  entry?: Entry | null;
}) {
  const [form, setForm] = useState<EntryFormData>({
    title: entry?.title ?? '',
    value: entry?.value ?? 0,
    type: entry?.type ?? EntryType.Credit,
    description: entry?.description ?? '',
    category: entry?.category ?? Category.None,
    date: entry?.date ? dayjs(entry.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
  });

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const isEditing = !!entry;
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (isEditing && entry) {
      const data: UpdateEntryRequest = { id: entry.id, walletId, ...form };
      updateMutation.mutate(data, { onSuccess: onClose });
    } else {
      const data: CreateEntryRequest = { walletId, ...form };
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    setForm({
      title: '',
      value: 0,
      type: EntryType.Credit,
      description: '',
      category: Category.None,
      date: dayjs().format('YYYY-MM-DD'),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? t.wallet.editEntry : t.wallet.newEntry}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label={t.common.title}
          margin="normal"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <TextField
          fullWidth
          label={t.common.value}
          type="number"
          margin="normal"
          value={form.value || ''}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        />
        <TextField
          fullWidth
          select
          label={t.common.type}
          margin="normal"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: Number(e.target.value) as EntryType })}
        >
          <MenuItem value={EntryType.Credit}>{t.common.credit}</MenuItem>
          <MenuItem value={EntryType.Debit}>{t.common.debit}</MenuItem>
        </TextField>
        <TextField
          fullWidth
          select
          label={t.common.category}
          margin="normal"
          value={form.category}
          onChange={(e) =>
            setForm({ ...form, category: Number(e.target.value) as Category })
          }
        >
          {Object.entries(CategoryLabels).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)}>
              {label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          fullWidth
          label={t.common.date}
          type="date"
          margin="normal"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <TextField
          fullWidth
          label={t.common.description}
          margin="normal"
          multiline
          rows={2}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t.common.cancel}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !form.title || createMutation.isPending || updateMutation.isPending
          }
        >
          {isEditing ? t.common.save : t.common.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const { t } = useLanguage();

  const now = dayjs();
  const month = now.month() + 1;
  const year = now.year();

  const { data: wallet, isLoading: walletLoading } = useWallet(id ?? '');
  const { data: entries, isLoading: entriesLoading } = useEntries(
    month,
    year,
    id ?? '',
  );
  const deleteMutation = useDeleteEntry();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate(
      { id: entryId, walletId: id ?? '' },
      { onSuccess: () => setDeleteConfirm(null) },
    );
  };

  if (walletLoading || entriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
        <IconButton onClick={() => navigate('/wallets')}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {wallet?.name}
          </Typography>
          {wallet?.description && (
            <Typography variant="body2" color="text.secondary">
              {wallet.description}
            </Typography>
          )}
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary">
          {formatCurrency(wallet?.balance ?? 0)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {t.wallet.entries} - {now.format('MMMM YYYY')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingEntry(null);
            setDialogOpen(true);
          }}
        >
          {t.wallet.newEntry}
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t.common.date}</TableCell>
              <TableCell>{t.common.title}</TableCell>
              <TableCell>{t.common.category}</TableCell>
              <TableCell>{t.common.type}</TableCell>
              <TableCell align="right">{t.common.value}</TableCell>
              <TableCell align="right">{t.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries?.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  {dayjs(entry.date).format('MM/DD/YYYY')}
                </TableCell>
                <TableCell>{entry.title}</TableCell>
                <TableCell>
                  <Chip
                    label={CategoryLabels[entry.category]}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={entry.type === EntryType.Credit ? t.common.credit : t.common.debit}
                    size="small"
                    color={entryTypeColors[entry.type]}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{ fontWeight: 600 }}
                    color={entry.type === EntryType.Credit ? 'success.main' : 'error.main'}
                  >
                    {entry.type === EntryType.Credit ? '+' : '-'}
                    {formatCurrency(entry.value)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditingEntry(entry);
                      setDialogOpen(true);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteConfirm(entry.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {entries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    {t.wallet.noEntries}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <EntryFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingEntry(null);
        }}
        walletId={id ?? ''}
        entry={editingEntry}
      />

      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>{t.wallet.deleteEntry}</DialogTitle>
        <DialogContent>
          <Typography>
            {t.wallet.deleteEntryMsg}
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
