import { useState } from 'react';
import dayjs from 'dayjs';
import {
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from '@mui/material';
import { useCreateEntry, useUpdateEntry } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import type { CreateEntryRequest, Entry, EntryKind, UpdateEntryRequest } from '@/types';
import { EntryKindLabels } from '@/utils/entryKind';
import { ResponsiveFormDialog } from '@/components/ResponsiveFormDialog';

interface EntryFormData {
  title: string;
  value: number;
  kind: EntryKind;
  description: string;
  tagId: string;
  date: string;
  isRecurring: boolean;
}

interface EntryFormDialogProps {
  open: boolean;
  onClose: () => void;
  entry?: Entry | null;
  fixedKind?: EntryKind;
}

export function EntryFormDialog({ open, onClose, entry, fixedKind }: EntryFormDialogProps) {
  const [form, setForm] = useState<EntryFormData>({
    title: entry?.title ?? '',
    value: entry?.value ?? 0,
    kind: entry?.kind ?? fixedKind ?? 0,
    description: entry?.description ?? '',
    tagId: entry?.tagId ?? '',
    date: entry?.date ? dayjs(entry.date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
    isRecurring: entry?.isRecurring ?? false,
  });

  const createMutation = useCreateEntry();
  const updateMutation = useUpdateEntry();
  const { data: tags } = useTags();
  const isEditing = !!entry;

  const handleSubmit = () => {
    const payload = { ...form, tagId: form.tagId || null };
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
      date: dayjs().format('YYYY-MM-DD'),
      isRecurring: false,
    });
    onClose();
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onClose={handleClose}
      title={isEditing ? 'Editar lançamento' : 'Novo lançamento'}
      actions={
        <>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!form.title || !form.value || createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Salvar' : 'Criar'}
          </Button>
        </>
      }
    >
      {fixedKind === undefined && (
        <TextField
          fullWidth
          select
          label="Tipo"
          margin="normal"
          value={form.kind}
          onChange={(e) => setForm({ ...form, kind: Number(e.target.value) as EntryKind })}
        >
          {Object.entries(EntryKindLabels).map(([value, label]) => (
            <MenuItem key={value} value={Number(value)}>
              {label}
            </MenuItem>
          ))}
        </TextField>
      )}

      <TextField
        fullWidth
        label="Título"
        margin="normal"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <TextField
        fullWidth
        label="Valor"
        type="number"
        margin="normal"
        value={form.value || ''}
        onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Tag</InputLabel>
        <Select
          value={form.tagId}
          label="Tag"
          onChange={(e) => setForm({ ...form, tagId: e.target.value })}
        >
          <MenuItem value="">Sem tag</MenuItem>
          {tags?.map((tag) => (
            <MenuItem key={tag.id} value={tag.id}>
              {tag.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label="Data"
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
        label="Repetir todo mês"
      />
      <TextField
        fullWidth
        label="Descrição"
        margin="normal"
        multiline
        rows={2}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </ResponsiveFormDialog>
  );
}
