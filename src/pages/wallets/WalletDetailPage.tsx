import { useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
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
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '@/hooks/useWallets';
import { useEntries, useCreateEntry, useUpdateEntry, useDeleteEntry } from '@/hooks/useEntries';
import type { Entry, CreateEntryRequest, UpdateEntryRequest } from '@/types';
import { EntryType, Category, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

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

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: EntryType | null) => {
    if (newType !== null) {
      setForm({ ...form, type: newType });
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? t.wallet.editEntry : t.wallet.newEntry}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {t.common.type}
          </Typography>
          <ToggleButtonGroup
            value={form.type}
            exclusive
            onChange={handleTypeChange}
            fullWidth
            sx={{
              '& .MuiToggleButton-root': {
                py: 1.5,
                textTransform: 'none',
                fontWeight: 600,
              },
            }}
          >
            <ToggleButton value={EntryType.Credit} color="success">
              {t.common.credit}
            </ToggleButton>
            <ToggleButton value={EntryType.Debit} color="error">
              {t.common.debit}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
        <TextField
          fullWidth
          label={t.common.value}
          type="number"
          margin="normal"
          value={form.value || ''}
          onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          fullWidth
          label={t.common.title}
          margin="normal"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
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
          <MenuItem value={Category.None}>{t.category.selectCategory}</MenuItem>
          {Object.entries(CategoryLabels)
            .filter(([key]) => key !== '0')
            .map(([value, label]) => (
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
            !form.title || !form.value || createMutation.isPending || updateMutation.isPending
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

  const now = new Date();

  const { data: wallet, isLoading: walletLoading } = useWallet(id ?? '');
  const { data: entries, isLoading: entriesLoading } = useEntries(
    now.getMonth() + 1,
    now.getFullYear(),
    id ?? '',
  );
  const deleteMutation = useDeleteEntry();

  const handleDelete = (entryId: string) => {
    deleteMutation.mutate(
      { id: entryId, walletId: id ?? '' },
      { onSuccess: () => setDeleteConfirm(null) },
    );
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  };

  if (walletLoading || entriesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const monthResult = (entries ?? []).reduce((acc, entry) => {
    return entry.type === EntryType.Credit
      ? acc + entry.value
      : acc - entry.value;
  }, 0);

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
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t.wallet.currentBalance}
          </Typography>
          <Typography variant="h5" sx={{ fontWeight: 700 }} color="primary.main">
            {formatCurrency(wallet?.balance ?? 0, wallet?.currency)}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t.wallet.incomeThisMonth}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpIcon color="success" fontSize="small" />
            <Typography variant="h5" sx={{ fontWeight: 700 }} color="success.main">
              {formatCurrency(
                (entries ?? []).filter((e) => e.type === EntryType.Credit).reduce((s, e) => s + e.value, 0),
                wallet?.currency
              )}
            </Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t.wallet.expensesThisMonth}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingDownIcon color="error" fontSize="small" />
            <Typography variant="h5" sx={{ fontWeight: 700 }} color="error.main">
              {formatCurrency(
                (entries ?? []).filter((e) => e.type === EntryType.Debit).reduce((s, e) => s + e.value, 0),
                wallet?.currency
              )}
            </Typography>
          </Box>
        </Paper>
        <Paper sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {t.wallet.monthResult}
          </Typography>
          <Typography
            variant="h5"
            sx={{ fontWeight: 700 }}
            color={monthResult >= 0 ? 'success.main' : 'error.main'}
          >
            {monthResult >= 0 ? '+' : ''}{formatCurrency(monthResult, wallet?.currency)}
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          {t.wallet.entries}
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
              <TableCell align="right">{t.common.value}</TableCell>
              <TableCell align="right">{t.common.actions}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(entries ?? []).map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>{formatDate(entry.date)}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {entry.type === EntryType.Credit ? (
                      <TrendingUpIcon fontSize="small" color="success" />
                    ) : (
                      <TrendingDownIcon fontSize="small" color="error" />
                    )}
                    {entry.title}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip
                    label={CategoryLabels[entry.category]}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography
                    sx={{ fontWeight: 600 }}
                    color={entry.type === EntryType.Credit ? 'success.main' : 'error.main'}
                  >
                    {entry.type === EntryType.Credit ? '+' : '-'}
                    {formatCurrency(entry.value, wallet?.currency)}
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
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => setDeleteConfirm(entry.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {entries?.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Box sx={{ py: 4 }}>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {t.wallet.noEntriesYet}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t.wallet.createFirstEntry}
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
