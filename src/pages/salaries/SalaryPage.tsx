import { useState } from 'react';
import {
  Typography,
  Button,
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
  IconButton,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import dayjs from 'dayjs';
import { useWallets } from '@/hooks/useWallets';
import { useSalaries, useCreateSalary, useUpdateSalary, useDeleteSalary } from '@/hooks/useSalaries';
import type { Salary, CreateSalaryRequest, UpdateSalaryRequest, Wallet } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

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
        {!isEditing && (
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
        )}
        <TextField
          fullWidth
          label={t.common.amount}
          type="number"
          margin="normal"
          value={form.amount || ''}
          onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
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

export default function SalaryPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; walletId: string } | null>(null);
  const { t } = useLanguage();

  const { data: wallets } = useWallets();
  const walletId = wallets?.[0]?.id ?? '';
  const { data: salaries, isLoading } = useSalaries(walletId);
  const deleteMutation = useDeleteSalary();

  const handleDelete = (id: string, wid: string) => {
    deleteMutation.mutate(
      { id, walletId: wid },
      { onSuccess: () => setDeleteConfirm(null) },
    );
  };

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
        <Typography color="text.secondary">
          {t.salary.noWalletsMsg}
        </Typography>
      )}

      {(wallets?.length ?? 0) > 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t.common.wallet}</TableCell>
                <TableCell>{t.common.amount}</TableCell>
                <TableCell>{t.common.day}</TableCell>
                <TableCell>{t.common.description}</TableCell>
                <TableCell>{t.common.status}</TableCell>
                <TableCell>{t.common.lastProcessed}</TableCell>
                <TableCell align="right">{t.common.actions}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}
              {salaries?.map((salary) => {
                const walletName =
                  wallets?.find((w) => w.id === salary.walletId)?.name ?? '-';
                return (
                  <TableRow key={salary.id}>
                    <TableCell>{walletName}</TableCell>
                    <TableCell>{formatCurrency(salary.amount)}</TableCell>
                    <TableCell>{salary.dayOfMonth}</TableCell>
                    <TableCell>{salary.description}</TableCell>
                    <TableCell>
                      <Chip
                        label={salary.active ? t.common.active : t.common.inactive}
                        color={salary.active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {salary.lastProcessedAt
                        ? dayjs(salary.lastProcessedAt).format('MM/DD/YYYY HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingSalary(salary);
                          setDialogOpen(true);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() =>
                          setDeleteConfirm({
                            id: salary.id,
                            walletId: salary.walletId,
                          })
                        }
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {salaries?.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      {t.salary.noSalaries}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
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
