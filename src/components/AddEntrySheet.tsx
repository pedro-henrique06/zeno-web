import { useState } from 'react';
import { Box, Drawer, List, ListItemButton, ListItemText, Typography } from '@mui/material';
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
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              pb: 'env(safe-area-inset-bottom)',
              bgcolor: 'background.paper',
            },
          },
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 1.5 }}>
          <Box sx={{ width: 36, height: 4, borderRadius: 2, bgcolor: 'divider' }} />
        </Box>
        <Typography sx={{ fontWeight: 700, px: 3, pt: 2, pb: 0.5, fontSize: '1rem' }}>
          {t('addEntrySheet.title')}
        </Typography>
        <List sx={{ pt: 0.5, pb: 2 }}>
          {KINDS.map((kind) => (
            <ListItemButton
              key={kind}
              sx={{ mx: 2, mb: 0.5, borderRadius: 2.5, py: 1.25 }}
              onClick={() => {
                setActiveKind(kind);
                onClose();
              }}
            >
              {/* Flat colored circle letter */}
              <Box
                sx={{
                  width: 40, height: 40, borderRadius: '50%',
                  bgcolor: EntryKindColors[kind],
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '15px', fontWeight: 700, color: '#fff',
                  mr: 2, flexShrink: 0,
                }}
              >
                {EntryKindLetters[kind]}
              </Box>
              <ListItemText
                primary={kindLabels[kind]}
                secondary={descriptions[kind]}
                slotProps={{
                  primary: { style: { fontWeight: 600 } },
                  secondary: { style: { fontSize: '0.78rem' } },
                }}
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
