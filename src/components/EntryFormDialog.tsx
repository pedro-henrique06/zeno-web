import { useState, useEffect } from 'react';
import dayjs from 'dayjs';
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries';
import type { CreateEntryRequest, Entry, UpdateEntryRequest } from '@/types';
import { EntryType, Category, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { ResponsiveFormDialog } from '@/components/ResponsiveFormDialog';

interface EntryFormData {
  walletId: string;
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
}

interface EntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  wallets: { id: string; name: string }[];
  fixedWalletId?: string;
  defaultWalletId?: string;
  entry?: Entry | null;
  defaultType?: EntryType;
  defaultCategory?: Category;
}

export function EntryFormDialog({
  open,
  onClose,
  wallets,
  fixedWalletId,
  defaultWalletId,
  entry,
  defaultType,
  defaultCategory,
}: EntryFormDialogProps) {
  const [form, setForm] = useState<EntryFormData>({
    walletId: entry?.walletId ?? fixedWalletId ?? defaultWalletId ?? wallets[0]?.id ?? '',
    title: entry?.title ?? '',
    value: entry?.value ?? 0,
    type: entry?.type ?? defaultType ?? EntryType.Credit,
    description: entry?.description ?? '',
    category: entry?.category ?? defaultCategory ?? Category.None,
    date: entry?.date ? dayjs(entry.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
  });

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const isEditing = !!entry;
  const { t } = useLanguage();

  useEffect(() => {
    if (!fixedWalletId && form.walletId === '' && wallets.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm((prev) => ({ ...prev, walletId: wallets[0].id }));
    }
    // Only sync on initial wallet load, not on form changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, fixedWalletId]);

  const handleSubmit = () => {
    if (isEditing && entry) {
      const data: UpdateEntryRequest = { id: entry.id, ...form };
      updateMutation.mutate(data, { onSuccess: onClose });
    } else {
      const data: CreateEntryRequest = { ...form };
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    setForm({
      walletId: fixedWalletId ?? defaultWalletId ?? wallets[0]?.id ?? '',
      title: '',
      value: 0,
      type: defaultType ?? EntryType.Credit,
      description: '',
      category: defaultCategory ?? Category.None,
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
    <ResponsiveFormDialog
      open={open}
      onClose={handleClose}
      title={isEditing ? t.wallet.editEntry : t.wallet.newEntry}
      actions={
        <>
          <Button onClick={handleClose}>{t.common.cancel}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              !form.walletId || !form.title || !form.value || createMutation.isPending || updateMutation.isPending
            }
          >
            {isEditing ? t.common.save : t.common.create}
          </Button>
        </>
      }
    >
      {!fixedWalletId && (
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
        onChange={(e) => setForm({ ...form, category: Number(e.target.value) as Category })}
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
    </ResponsiveFormDialog>
  );
}
