import { useState, type ChangeEvent } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useProfile } from '@/hooks/useUser';
import type { CreateEntryRequest, Entry, EntryKind, UpdateEntryRequest } from '@/types';
import { useEntryKindLabels } from '@/utils/entryKind';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import { ResponsiveFormDialog } from '@/components/ResponsiveFormDialog';

const MAX_VALUE_CENTS = 99_999_999_99;

interface EntryFormData {
  title: string;
  value: number;
  kind: EntryKind;
  description: string;
  tagId: string;
  date: string;
  isRecurring: boolean;
  hasRecurrenceEndDate: boolean;
  recurrenceEndDate: string;
}

interface EntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  entry?: Entry | null;
  fixedKind?: EntryKind;
  defaultDate?: string;
}

export function EntryFormDialog({ open, onClose, entry, fixedKind, defaultDate }: EntryFormDialogProps) {
  const { t } = useTranslation();
  const kindLabels = useEntryKindLabels();
  const { data: profile } = useProfile();
  const [form, setForm] = useState<EntryFormData>({
    title: entry?.title ?? '',
    value: entry?.value ?? 0,
    kind: entry?.kind ?? fixedKind ?? 0,
    description: entry?.description ?? '',
    tagId: entry?.tagId ?? '',
    date: entry?.date ? dayjs(entry.date).format('YYYY-MM-DD') : defaultDate ?? dayjs().format('YYYY-MM-DD'),
    isRecurring: entry?.isRecurring ?? false,
    hasRecurrenceEndDate: !!entry?.recurrenceEndDate,
    recurrenceEndDate: entry?.recurrenceEndDate ? dayjs(entry.recurrenceEndDate).format('YYYY-MM-DD') : '',
  });
  const [valueCents, setValueCents] = useState(Math.round((entry?.value ?? 0) * 100));

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const { data: tags } = useTags();
  const isEditing = !!entry;

  const handleValueChange = (e: ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    const next = Math.min(Number(digits || '0'), MAX_VALUE_CENTS);
    setValueCents(next);
    setForm((f) => ({ ...f, value: next / 100 }));
  };

  const displayValue = (valueCents / 100).toLocaleString(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const handleSubmit = () => {
    const payload = {
      ...form,
      tagId: form.tagId || null,
      recurrenceEndDate: form.isRecurring && form.hasRecurrenceEndDate && form.recurrenceEndDate ? form.recurrenceEndDate : null,
    };
    if (isEditing && entry) {
      const data: UpdateEntryRequest = { id: entry.id, ...payload };
      updateMutation.mutate(data, { onSuccess: onClose });
    } else {
      const data: CreateEntryRequest = payload;
      createMutation.mutate(data, { onSuccess: onClose });
    }
  };

  const handleClose = () => {
    setForm({
      title: '',
      value: 0,
      kind: fixedKind ?? 0,
      description: '',
      tagId: '',
      date: defaultDate ?? dayjs().format('YYYY-MM-DD'),
      isRecurring: false,
      hasRecurrenceEndDate: false,
      recurrenceEndDate: '',
    });
    setValueCents(0);
    onClose();
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onClose={handleClose}
      title={isEditing ? t('entryForm.editTitle') : t('entryForm.newTitle')}
      actions={
        <>
          <Button onClick={handleClose}>{t('common.cancel')}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!form.title || !form.value || createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? t('entryForm.save') : t('entryForm.create')}
          </Button>
        </>
      }
    >
      {fixedKind === undefined && (
        <TextField
          fullWidth
          select
          label={t('entryForm.type')}
          margin="normal"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: Number(e.target.value) as EntryKind })}
        >
          {Object.entries(kindLabels).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        label={t('entryForm.titleField')}
        margin="normal"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <TextField
        fullWidth
        label={t('entryForm.value')}
        margin="normal"
        value={displayValue}
        onChange={handleValueChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">{CURRENCY_SYMBOLS[profile?.currency ?? 'BRL']}</InputAdornment>
            ),
          },
          htmlInput: { inputMode: 'numeric' },
        }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>{t('entryForm.tag')}</InputLabel>
        <Select
          value={form.tagId}
          label={t('entryForm.tag')}
          onChange={(e) => setForm({ ...form, tagId: e.target.value })}
        >
          <MenuItem value="">{t('common.noTag')}</MenuItem>
          {tags?.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label={t('entryForm.date')}
        type="date"
        margin="normal"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <FormControlLabel
        sx={{ mt: 1 }}
        control={
          <Switch
            checked={form.isRecurring}
            onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
          />
        }
        label={t('entryForm.recurring')}
      />
      {form.isRecurring && (
        <>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                checked={form.hasRecurrenceEndDate}
                onChange={(e) => setForm({ ...form, hasRecurrenceEndDate: e.target.checked })}
              />
            }
            label={t('entryForm.hasRecurrenceEndDate')}
          />
          {form.hasRecurrenceEndDate && (
            <TextField
              fullWidth
              label={t('entryForm.recurrenceEndDate')}
              type="date"
              margin="normal"
              value={form.recurrenceEndDate}
              onChange={(e) => setForm({ ...form, recurrenceEndDate: e.target.value })}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          )}
        </>
      )}
      <TextField
        fullWidth
        label={t('entryForm.description')}
        margin="normal"
        multiline
        rows={2}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </ResponsiveFormDialog>
  );
}
