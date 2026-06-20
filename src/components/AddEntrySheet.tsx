import { useState } from 'react';
import { Avatar, Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { useWallets } from '@/hooks/useWallets';
import { useLanguage } from '@/i18n/LanguageContext';
import { Category, EntryType } from '@/types';
import { EntryKindColors, EntryKindLetters, type EntryKind } from '@/utils/entryKind';
import { EntryFormDialog } from '@/components/EntryFormDialog';

interface AddEntrySheetProps {
  open: boolean;
  onClose: () => void;
}

const KIND_DEFAULTS: Record<EntryKind, { type: EntryType; category: Category }> = {
  entrada: { type: EntryType.Credit, category: Category.Salary },
  saida: { type: EntryType.Debit, category: Category.Utilities },
  diario: { type: EntryType.Debit, category: Category.Restaurant },
  economia: { type: EntryType.Debit, category: Category.None },
  cartao: { type: EntryType.Debit, category: Category.None },
};

export function AddEntrySheet({ open, onClose }: AddEntrySheetProps) {
  const { t } = useLanguage();
  const { data: wallets } = useWallets();
  const [activeKind, setActiveKind] = useState<EntryKind | null>(null);

  const shortcuts: { kind: EntryKind; label: string; description: string }[] = [
    { kind: 'entrada', label: t.addEntry.entrada, description: t.addEntry.entradaDesc },
    { kind: 'saida', label: t.addEntry.saida, description: t.addEntry.saidaDesc },
    { kind: 'diario', label: t.addEntry.diario, description: t.addEntry.diarioDesc },
    { kind: 'economia', label: t.addEntry.economia, description: t.addEntry.economiaDesc },
    { kind: 'cartao', label: t.addEntry.cartao, description: t.addEntry.cartaoDesc },
  ];

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
          {t.addEntry.title}
        </Typography>
        <List sx={{ pt: 1, pb: 2 }}>
          {shortcuts.map((shortcut) => (
            <ListItemButton
              key={shortcut.kind}
              sx={{ mx: 2, mb: 0.5, borderRadius: 2 }}
              onClick={() => {
                setActiveKind(shortcut.kind);
                onClose();
              }}
            >
              <ListItemIcon>
                <Avatar sx={{ bgcolor: EntryKindColors[shortcut.kind], width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
                  {EntryKindLetters[shortcut.kind]}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={shortcut.label}
                secondary={shortcut.description}
                sx={{ ml: 1 }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      {activeKind && (
        <EntryFormDialog
          open={!!activeKind}
          onClose={() => setActiveKind(null)}
          wallets={wallets ?? []}
          defaultType={KIND_DEFAULTS[activeKind].type}
          defaultCategory={KIND_DEFAULTS[activeKind].category}
        />
      )}
    </>
  );
}
