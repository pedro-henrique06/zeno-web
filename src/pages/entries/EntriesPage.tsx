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
  Box,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import type { Entry } from '@/types';
import { EntryKindColors, EntryKindLetters, EntryKindLabels, isCredit } from '@/utils/entryKind';
import { formatCurrency, formatDate } from '@/utils/currency';
import { useIsMobile } from '@/hooks/useIsMobile';
import { groupEntriesByDate } from '@/utils/groupEntriesByDate';
import { EntryFormDialog } from '@/components/EntryFormDialog';

function EntryCard({ entry, tagName, onClick }: { entry: Entry; tagName?: string; onClick: () => void }) {
  const credit = isCredit(entry.kind);
  return (
    <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={onClick}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: EntryKindColors[entry.kind],
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {EntryKindLetters[entry.kind]}
            </Box>
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {entry.title}
            </Typography>
          </Box>
          <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }} color={credit ? 'success.main' : 'error.main'}>
            {credit ? '+' : '-'}
            {formatCurrency(entry.value)}
          </Typography>
        </Box>
        <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
          <Chip label={EntryKindLabels[entry.kind]} size="small" variant="outlined" />
          {tagName && <Chip label={tagName} size="small" />}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function EntriesPage() {
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data, isLoading, isError } = useEntries(month, year);
  const { data: tags } = useTags();

  const tagNameById = new Map((tags ?? []).map((tag) => [tag.id, tag.name]));

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Não foi possível carregar os lançamentos. Tente novamente.</Typography>
      </Box>
    );
  }

  const entries = data?.items ?? [];

  const openEdit = (entry: Entry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const openCreate = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Lançamentos
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
          Novo
        </Button>
      </Box>

      {entries.length > 0 ? (
        isMobile ? (
          <Stack spacing={2.5}>
            {groupEntriesByDate(entries).map((group) => (
              <Box key={group.key}>
                <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: 0.5, pl: 0.5 }}>
                  {group.label}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {group.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      tagName={entry.tagId ? tagNameById.get(entry.tagId) : undefined}
                      onClick={() => openEdit(entry)}
                    />
                  ))}
                </Stack>
              </Box>
            ))}
          </Stack>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Data</TableCell>
                  <TableCell>Título</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Tag</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => {
                  const credit = isCredit(entry.kind);
                  const tagName = entry.tagId ? tagNameById.get(entry.tagId) : undefined;
                  return (
                    <TableRow
                      key={entry.id}
                      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                      onClick={() => openEdit(entry)}
                    >
                      <TableCell>{formatDate(entry.date)}</TableCell>
                      <TableCell>{entry.title}</TableCell>
                      <TableCell>
                        <Chip label={EntryKindLabels[entry.kind]} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{tagName ?? '-'}</TableCell>
                      <TableCell align="right">
                        <Typography sx={{ fontWeight: 600 }} color={credit ? 'success.main' : 'error.main'}>
                          {credit ? '+' : '-'}
                          {formatCurrency(entry.value)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )
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
            Nenhum lançamento este mês
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adicione um lançamento para começar a controlar suas finanças.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            Novo
          </Button>
        </Box>
      )}

      <EntryFormDialog
        key={editingEntry?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        entry={editingEntry}
      />
    </Box>
  );
}
