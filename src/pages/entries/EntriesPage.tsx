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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import { useWallets } from '@/hooks/useWallets';
import { useEntries } from '@/hooks/useEntries';
import type { Entry } from '@/types';
import { EntryType, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';
import { useIsMobile } from '@/hooks/useIsMobile';
import { groupEntriesByDate } from '@/utils/groupEntriesByDate';
import { EntryFormDialog } from '@/components/EntryFormDialog';

function EntryCard({
  entry,
  onClick,
}: {
  entry: Entry;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 1 }}>
            {entry.type === EntryType.Credit ? (
              <TrendingUpIcon fontSize="small" color="success" />
            ) : (
              <TrendingDownIcon fontSize="small" color="error" />
            )}
            <Typography sx={{ fontWeight: 600 }} noWrap>
              {entry.title}
            </Typography>
          </Box>
          <Typography
            sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
            color={entry.type === EntryType.Credit ? 'success.main' : 'error.main'}
          >
            {entry.type === EntryType.Credit ? '+' : '-'}
            {formatCurrency(entry.value)}
          </Typography>
        </Box>
        <Box sx={{ mt: 1.5 }}>
          <Chip label={CategoryLabels[entry.category]} size="small" variant="outlined" />
        </Box>
      </CardContent>
    </Card>
  );
}

export default function EntriesPage() {
  const navigate = useNavigate();
  const { t, locale } = useLanguage();
  const isMobile = useIsMobile();
  const [walletId, setWalletId] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: wallets } = useWallets();
  const { data: entries, isLoading } = useEntries(month, year, walletId);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t.nav.entries}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setDialogOpen(true)}
          disabled={!wallets?.length}
        >
          {t.wallet.newEntry}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 300 }}>
          <InputLabel>{t.common.wallet}</InputLabel>
          <Select
            value={walletId}
            label={t.common.wallet}
            onChange={(e) => setWalletId(e.target.value)}
          >
            <MenuItem value="">{t.entry.selectType}</MenuItem>
            {wallets?.map((w) => (
              <MenuItem key={w.id} value={w.id}>
                {w.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {entries && entries.length > 0 ? (
        isMobile ? (
          <Stack spacing={2.5}>
            {groupEntriesByDate(entries, locale, {
              today: t.common.today,
              yesterday: t.common.yesterday,
            }).map((group) => (
              <Box key={group.key}>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ fontWeight: 700, letterSpacing: 0.5, pl: 0.5 }}
                >
                  {group.label}
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  {group.entries.map((entry) => (
                    <EntryCard
                      key={entry.id}
                      entry={entry}
                      onClick={() => navigate(`/wallets/${entry.walletId}`)}
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
                  <TableCell>{t.common.date}</TableCell>
                  <TableCell>{t.common.title}</TableCell>
                  <TableCell>{t.common.category}</TableCell>
                  <TableCell align="right">{t.common.value}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow
                    key={entry.id}
                    sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                    onClick={() => navigate(`/wallets/${entry.walletId}`)}
                  >
                    <TableCell>{formatDate(entry.date)}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {entry.type === EntryType.Credit ? (
                          <TrendingUpIcon fontSize="small" color="success" />
                        ) : (
                          <TrendingDownIcon fontSize="small" color="error" />
                        )}
                        {entry.title}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={CategoryLabels[entry.category]}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        sx={{ fontWeight: 600 }}
                        color={entry.type === EntryType.Credit ? 'success.main' : 'error.main'}
                      >
                        {entry.type === EntryType.Credit ? '+' : '-'}
                        {formatCurrency(entry.value)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
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
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
            disabled={!wallets?.length}
          >
            {t.wallet.newEntry}
          </Button>
        </Box>
      )}

      <EntryFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        wallets={wallets ?? []}
        defaultWalletId={walletId || undefined}
      />
    </Box>
  );
}