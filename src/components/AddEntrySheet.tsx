import { useState } from 'react';
import { Avatar, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { EntryKind } from '@/types';
import { EntryKindColors, EntryKindLetters, useEntryKindLabels } from '@/utils/entryKind';
import { EntryFormDialog } from '@/components/EntryFormDialog';

interface AddEntrySheetProps {
  open: boolean;
  onClose: () => void;
}

const KINDS = [EntryKind.Entrada, EntryKind.Saida, EntryKind.Diario, EntryKind.Economia, EntryKind.Cartao];

export function AddEntrySheet({ open, onClose }: AddEntrySheetProps) {
  const { t } = useTranslation();
  const kindLabels = useEntryKindLabels();
  const descriptions: Record<number, string> = {
    [EntryKind.Entrada]: t('addEntrySheet.descriptions.entrada'),
    [EntryKind.Saida]: t('addEntrySheet.descriptions.saida'),
    [EntryKind.Diario]: t('addEntrySheet.descriptions.diario'),
    [EntryKind.Economia]: t('addEntrySheet.descriptions.economia'),
    [EntryKind.Cartao]: t('addEntrySheet.descriptions.cartao'),
  };
  const [activeKind, setActiveKind] = useState<number | null>(null);

  return (
    <>
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: {
            sx: {
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              pb: 'env(safe-area-inset-bottom)',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
          <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, px: 3, pt: 1.5, pb: 0.5 }}>
          {t('addEntrySheet.title')}
        </Typography>
        <List sx={{ pt: 1, pb: 2 }}>
          {KINDS.map((kind) => (
            <ListItemButton
              key={kind}
              sx={{ mx: 2, mb: 0.5, borderRadius: 2 }}
              onClick={() => {
                setActiveKind(kind);
                onClose();
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ bgcolor: EntryKindColors[kind], width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                  {EntryKindLetters[kind]}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={kindLabels[kind]}
                secondary={descriptions[kind]}
                sx={{ ml: 1 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {activeKind !== null && (
        <EntryFormDialog
          open={activeKind !== null}
          onClose={() => setActiveKind(null)}
          fixedKind={activeKind as 0 | 1 | 2 | 3 | 4}
        />
      )}
    </>
  );
}
