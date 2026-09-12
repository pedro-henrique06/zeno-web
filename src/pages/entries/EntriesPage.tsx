import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import dayjs from 'dayjs';
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
  Stack,
  CircularProgress,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RepeatIcon from '@mui/icons-material/Repeat';
import { useTranslation } from 'react-i18next';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useProfile } from '@/hooks/useUser';
import { EntryKind, type Entry } from '@/types';
import { EntryKindColors, EntryKindLetters, useEntryKindLabels, isCredit } from '@/utils/entryKind';
import { formatCurrency, formatDate } from '@/utils/currency';
import { useIsMobile } from '@/hooks/useIsMobile';
import { groupEntriesByDate } from '@/utils/groupEntriesByDate';
import { EntryFormDialog } from '@/components/EntryFormDialog';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { StickyHeader } from '@/components/layout/StickyHeader';
import type { Currency, Language } from '@/types';

/** Colored dot: filled for past, open ring for future */
function EntryDot({ kind, isFuture }: { kind: EntryKind; isFuture?: boolean }) {
  const color = EntryKindColors[kind];
  return (
    <Box
      sx={{
        width: 9,
        height: 9,
        borderRadius: '50%',
        flexShrink: 0,
        bgcolor: isFuture ? 'transparent' : color,
        border: isFuture ? `2px solid ${color}` : 'none',
      }}
    />
  );
}

function EntryCard({
  entry,
  tagName,
  onClick,
  kindLabels,
  currency,
  language,
}: {
  entry: Entry;
  tagName?: string;
  onClick: () => void;
  kindLabels: Record<EntryKind, string>;
  currency?: Currency;
  language?: Language;
}) {
  const credit = isCredit(entry.kind);
  const today = dayjs().startOf('day');
  const isFuture = dayjs(entry.date.substring(0, 10)).isAfter(today);

  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
        opacity: isFuture ? 0.72 : 1,
      }}
    >
      {/* Kind indicator */}
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: isFuture ? 'transparent' : `${EntryKindColors[entry.kind]}18`,
          border: isFuture ? `1.5px solid ${EntryKindColors[entry.kind]}` : 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 700,
            color: EntryKindColors[entry.kind],
          }}
        >
          {EntryKindLetters[entry.kind]}
        </Typography>
      </Box>

      {/* Title + meta */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Typography sx={{ fontWeight: 600, fontSize: '0.9rem' }} noWrap>
            {entry.title}
          </Typography>
          {entry.isRecurring && <RepeatIcon sx={{ fontSize: 13, color: 'text.secondary', flexShrink: 0 }} />}
        </Box>
        <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25 }}>
          <Typography variant="caption" color="text.secondary">
            {kindLabels[entry.kind]}
          </Typography>
          {tagName && (
            <>
              <Typography variant="caption" color="text.disabled">
                ·
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {tagName}
              </Typography>
            </>
          )}
        </Box>
      </Box>

      {/* Value */}
      <Typography
        sx={{
          fontWeight: 700,
          whiteSpace: 'nowrap',
          fontVariantNumeric: 'tabular-nums',
          fontSize: '0.95rem',
        }}
        color={credit ? 'success.main' : 'error.main'}
      >
        {credit ? '+' : '-'}
        {formatCurrency(entry.value, currency, language)}
      </Typography>
    </Box>
  );
}

const ALL_KINDS = [EntryKind.Entrada, EntryKind.Saida, EntryKind.Diario, EntryKind.Economia, EntryKind.Cartao];

function parseKinds(param: string | null): EntryKind[] {
  if (!param) return ALL_KINDS;
  const parsed = param
    .split(',')
    .map((v) => Number(v))
    .filter((v): v is EntryKind => ALL_KINDS.includes(v as EntryKind));
  return parsed.length > 0 ? parsed : ALL_KINDS;
}

export default function EntriesPage() {
  const { t } = useTranslation();
  const { data: profile } = useProfile();
  const kindLabels = useEntryKindLabels();
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

  const [searchParams, setSearchParams] = useSearchParams();
  const now = new Date();
  const month = Number(searchParams.get('month')) || now.getMonth() + 1;
  const year = Number(searchParams.get('year')) || now.getFullYear();

  const activeKinds = parseKinds(searchParams.get('kinds'));
  const focusDate = searchParams.get('date');
  const focusRowRef = useRef<HTMLDivElement & HTMLTableRowElement>(null);
  const hasScrolledToFocusRef = useRef(false);

  const handleMonthChange = (m: number, y: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('month', String(m));
      next.set('year', String(y));
      return next;
    });
  };

  const toggleKind = (kind: EntryKind) => {
    const next = activeKinds.includes(kind) ? activeKinds.filter((k) => k !== kind) : [...activeKinds, kind];
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.set('kinds', (next.length > 0 ? next : ALL_KINDS).join(','));
      return params;
    });
  };

  const { data, isLoading, isError } = useEntries(month, year);
  const { data: tags } = useTags();

  const tagNameById = new Map((tags ?? []).map((tag) => [tag.id, tag.name]));

  useEffect(() => {
    if (!focusDate || hasScrolledToFocusRef.current) return;
    if (!focusRowRef.current) return;
    focusRowRef.current.scrollIntoView({ block: 'center' });
    hasScrolledToFocusRef.current = true;
  }, [data, focusDate]);

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
        <Typography color="error">{t('entries.loadError')}</Typography>
      </Box>
    );
  }

  const entries = (data?.items ?? []).filter((entry) => activeKinds.includes(entry.kind));
  const focusEntryId = focusDate
    ? entries.find((entry) => entry.date.substring(0, 10) === focusDate)?.id
    : undefined;

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
      <StickyHeader>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            {t('entries.title')}
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
            {t('entries.new')}
          </Button>
        </Box>

        <MonthSwitcher month={month} year={year} onChange={handleMonthChange} />

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {t('entries.filter')}
          </Typography>
          {ALL_KINDS.map((kind) => {
            const active = activeKinds.includes(kind);
            return (
              <Box
                key={kind}
                onClick={() => toggleKind(kind)}
                title={kindLabels[kind]}
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: active ? `${EntryKindColors[kind]}22` : 'action.hover',
                  color: active ? EntryKindColors[kind] : 'text.secondary',
                  border: active ? `1.5px solid ${EntryKindColors[kind]}` : '1.5px solid transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {EntryKindLetters[kind]}
              </Box>
            );
          })}
        </Box>
      </StickyHeader>

      <Box sx={{ mt: 2 }}>
        {entries.length > 0 ? (
          isMobile ? (
            <Stack spacing={2.5}>
              {groupEntriesByDate(entries).map((group) => (
                <Box key={group.key} ref={group.key === focusDate ? focusRowRef : undefined}>
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: 0.5, pl: 0.5 }}
                  >
                    {group.label}
                  </Typography>
                  <Stack spacing={1} sx={{ mt: 0.75 }}>
                    {group.entries.map((entry) => (
                      <EntryCard
                        key={entry.id}
                        entry={entry}
                        tagName={entry.tagId ? tagNameById.get(entry.tagId) : undefined}
                        onClick={() => openEdit(entry)}
                        kindLabels={kindLabels}
                        currency={profile?.currency}
                        language={profile?.language}
                      />
                    ))}
                  </Stack>
                </Box>
              ))}
            </Stack>
          ) : (
            <TableContainer
              component={Paper}
              sx={{ border: '1px solid', borderColor: 'divider', boxShadow: 'none', borderRadius: 3 }}
            >
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('entries.date')}</TableCell>
                    <TableCell>{t('entries.titleColumn')}</TableCell>
                    <TableCell>{t('entries.type')}</TableCell>
                    <TableCell>{t('entries.tag')}</TableCell>
                    <TableCell align="right">{t('entries.value')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => {
                    const credit = isCredit(entry.kind);
                    const tagName = entry.tagId ? tagNameById.get(entry.tagId) : undefined;
                    const today = dayjs().startOf('day');
                    const isFuture = dayjs(entry.date.substring(0, 10)).isAfter(today);
                    return (
                      <TableRow
                        key={entry.id}
                        ref={entry.id === focusEntryId ? focusRowRef : undefined}
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { bgcolor: 'action.hover' },
                          opacity: isFuture ? 0.7 : 1,
                        }}
                        onClick={() => openEdit(entry)}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <EntryDot kind={entry.kind} isFuture={isFuture} />
                            {formatDate(entry.date, profile?.language)}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                            {entry.title}
                            {entry.isRecurring && (
                              <RepeatIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip label={kindLabels[entry.kind]} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>{tagName ?? '-'}</TableCell>
                        <TableCell align="right">
                          <Typography
                            sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}
                            color={credit ? 'success.main' : 'error.main'}
                          >
                            {credit ? '+' : '-'}
                            {formatCurrency(entry.value, profile?.currency, profile?.language)}
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
              {t('entries.emptyTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {t('entries.emptySubtitle')}
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreate}>
              {t('entries.new')}
            </Button>
          </Box>
        )}
      </Box>

      <EntryFormDialog
        key={editingEntry?.id ?? 'new'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        entry={editingEntry}
      />
    </Box>
  );
}
