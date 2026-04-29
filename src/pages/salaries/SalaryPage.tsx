import { useState, useEffect } from 'react';
import {
  Typography,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useWallets } from '@/hooks/useWallets';
import { useSalaries, useCreateSalary, useUpdateSalary, useDeleteSalary } from '@/hooks/useSalaries';
import type { Salary, CreateSalaryRequest, UpdateSalaryRequest, Wallet } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency, formatDate } from '@/utils/currency';

interface SalaryFormData {
  walletId: string;
  amount: number;
  description: string;
  dayOfMonth: number;
  active: boolean;
}

function SalaryFormDialog({
  open,
  onClose,
  wallets,
  salary,
}: {
  open: boolean;
  onClose: () => void;
  wallets: Wallet[];
  salary?: Salary | null;
}) {
  const [form, setForm] = useState<SalaryFormData>({
    walletId: salary?.walletId ?? wallets[0]?.id ?? '',
    amount: salary?.amount ?? 0,
    description: salary?.description ?? '',
    dayOfMonth: salary?.dayOfMonth ?? 1,
    active: salary?.active ?? true,
  });

  const createMutation = useCreateSalary();
  const updateMutation = useUpdateSalary();
  const isEditing = !!salary;
  const { t } = useLanguage();

  const handleSubmit = () => {
    if (isEditing && salary) {
      const data: UpdateSalaryRequest = { id: salary.id, ...form };
      updateMutation.mutate(data, { onSuccess: onClose });
    } else {
      const data: CreateSalaryRequest = form;
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    setForm({
      walletId: wallets[0]?.id ?? '',
      amount: 0,
      description: '',
      dayOfMonth: 1,
      active: true,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{isEditing ? t.salary.editSalary : t.salary.newSalary}</DialogTitle>
      <DialogContent>
        {!isEditing ? (
          <FormControl fullWidth margin="normal">
            <InputLabel>{t.common.wallet}</InputLabel>
            <Select
              value={form.walletId}
              label={t.common.wallet}
              onChange={(e) => setForm({ ...form, walletId: e.target.value })}
            >
              {wallets.map((w) => (
                <MenuItem key={w.id} value={w.id}>
                  {w.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            fullWidth
            label={t.common.wallet}
            margin="normal"
            value={`${wallets.find((w) => w.id === salary?.walletId)?.name ?? '-'}`}
            slotProps={{ input: { readOnly: true } }}
          />
        )}
        <TextField
          fullWidth
          label={t.common.value}
          type="number"
          margin="normal"
          value={form.amount || ''}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
          slotProps={{ htmlInput: { min: 0 } }}
        />
        <TextField
          fullWidth
          label={t.salary.dayOfMonth}
          type="number"
          margin="normal"
          slotProps={{ htmlInput: { min: 1, max: 31 } }}
          value={form.dayOfMonth}
          onChange={(e) =>
            setForm({ ...form, dayOfMonth: Number(e.target.value) })
          }
        />
        <TextField
          fullWidth
          label={t.common.description}
          margin="normal"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        {isEditing && (
          <FormControl fullWidth margin="normal">
            <InputLabel>{t.common.status}</InputLabel>
            <Select
              value={String(form.active)}
              label={t.common.status}
              onChange={(e) => setForm({ ...form, active: e.target.value === 'true' })}
            >
              <MenuItem value="true">{t.common.active}</MenuItem>
              <MenuItem value="false">{t.common.inactive}</MenuItem>
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t.common.cancel}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={
            !form.walletId || !form.amount || createMutation.isPending || updateMutation.isPending
          }
        >
          {isEditing ? t.common.save : t.common.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface SalaryCardProps {
  salary: Salary;
  wallet: Wallet | undefined;
  onEdit: () => void;
  onDelete: () => void;
}

function SalaryCard({ salary, wallet, onEdit, onDelete }: SalaryCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useLanguage();

  return (
    <Card sx={{ position: 'relative' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {salary.description || t.salary.recurringIncome}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700 }} color="success.main">
              {formatCurrency(salary.amount, wallet?.currency)}
            </Typography>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Chip
              label={`Todo dia ${salary.dayOfMonth}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={salary.active ? t.common.active : t.common.inactive}
              size="small"
              color={salary.active ? 'success' : 'default'}
            />
          </Box>
        </Box>
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {t.common.wallet}: {wallet?.name ?? '-'}
          </Typography>
        </Box>
        {salary.lastProcessedAt && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {t.salary.lastEntry}: {formatDate(salary.lastProcessedAt)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default function SalaryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; walletId: string } | null>(null);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const { t } = useLanguage();

  const { data: wallets } = useWallets();
  const { data: salaries, isLoading } = useSalaries(selectedWalletId || (wallets?.[0]?.id ?? ''));

  useEffect(() => {
    if (!selectedWalletId && wallets?.length) {
      setSelectedWalletId(wallets[0].id);
    }
  }, [wallets, selectedWalletId]);
  const deleteMutation = useDeleteSalary();

  const handleDelete = (id: string, wid: string) => {
    deleteMutation.mutate(
      { id, walletId: wid },
      { onSuccess: () => setDeleteConfirm(null) },
    );
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
          {t.salary.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setEditingSalary(null);
            setDialogOpen(true);
          }}
          disabled={!wallets?.length}
        >
          {t.salary.newSalary}
        </Button>
      </Box>

      {!wallets?.length && (
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
            {t.salary.noWalletsMsg}
          </Typography>
        </Box>
      )}

      {(wallets?.length ?? 0) > 0 && (
        <>
          <Box sx={{ mb: 3 }}>
            <FormControl sx={{ minWidth: 300 }}>
              <InputLabel>{t.common.wallet}</InputLabel>
              <Select
                value={selectedWalletId || (wallets?.[0]?.id ?? '')}
                label={t.common.wallet}
                onChange={(e) => setSelectedWalletId(e.target.value)}
              >
                {wallets?.map((w) => (
                  <MenuItem key={w.id} value={w.id}>
                    {w.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {salaries && salaries.length > 0 ? (
            <Grid container spacing={3}>
              {salaries.map((salary) => {
                const wallet = wallets?.find((w) => w.id === salary.walletId);
                return (
                  <Grid size={{ xs: 12, sm: 6, md: 4 }} key={salary.id}>
                    <SalaryCard
                      salary={salary}
                      wallet={wallet}
                      onEdit={() => { setEditingSalary(salary); setDialogOpen(true); }}
                      onDelete={() => setDeleteConfirm({ id: salary.id, walletId: salary.walletId })}
                    />
                  </Grid>
                );
              })}
            </Grid>
          ) : (
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
                {t.salary.noSalaries}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {t.salary.createFirstSalary}
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => { setEditingSalary(null); setDialogOpen(true); }}
              >
                {t.salary.newSalary}
              </Button>
            </Box>
          )}
        </>
      )}

      <SalaryFormDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingSalary(null);
        }}
        wallets={wallets ?? []}
        salary={editingSalary}
      />

      <Dialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
      >
        <DialogTitle>{t.salary.deleteSalary}</DialogTitle>
        <DialogContent>
          <Typography>{t.salary.deleteSalaryMsg}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>{t.common.cancel}</Button>
          <Button
            onClick={() =>
              deleteConfirm && handleDelete(deleteConfirm.id, deleteConfirm.walletId)
            }
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
