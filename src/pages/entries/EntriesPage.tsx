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
  CircularProgress,
  IconButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import { useEntries } from '@/hooks/useEntries';
import { useWallets } from '@/hooks/useWallets';
import type { Entry } from '@/types';
import { EntryType, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

export default function EntriesPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const { data: wallets } = useWallets();

  const now = new Date();
  const { data: entries, isLoading } = useEntries(
    now.getMonth() + 1,
    now.getFullYear(),
    selectedWalletId,
  );

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t.nav.entries}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/wallets')}
        >
          {t.wallet.newEntry}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Selecione uma carteira para filtrar os lançamentos ou deixe vazio para ver todos.
        </Typography>
      </Box>

      {entries && entries.length > 0 ? (
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
            onClick={() => navigate('/wallets')}
          >
            {t.wallet.newEntry}
          </Button>
        </Box>
      )}
    </Box>
  );
}