import { useState } from 'react';
import { Avatar, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { EntryKind } from '@/types';
import { EntryKindColors, EntryKindLetters, EntryKindLabels } from '@/utils/entryKind';
import { EntryFormDialog } from '@/components/EntryFormDialog';

interface AddEntrySheetProps {
  open: boolean;
  onClose: () => void;
}

const DESCRIPTIONS: Record<number, string> = {
  [EntryKind.Entrada]: 'Dinheiro que entrou',
  [EntryKind.Saida]: 'Conta ou despesa fixa',
  [EntryKind.Diario]: 'Gasto do dia a dia',
  [EntryKind.Economia]: 'Dinheiro guardado',
  [EntryKind.Cartao]: 'Compra no cartão de crédito',
};

const KINDS = [EntryKind.Entrada, EntryKind.Saida, EntryKind.Diario, EntryKind.Economia, EntryKind.Cartao];

export function AddEntrySheet({ open, onClose }: AddEntrySheetProps) {
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
          Adicionar
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
                primary={EntryKindLabels[kind]}
                secondary={DESCRIPTIONS[kind]}
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
