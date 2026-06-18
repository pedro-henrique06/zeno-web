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
  TextField,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { useWallets } from '@/hooks/useWallets';
import { useEntries, useCreateEntry } from '@/hooks/useEntries';
import type { Entry } from '@/types';
import { EntryType, Category, CategoryLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';
import { ResponsiveFormDialog } from '@/components/ResponsiveFormDialog';
import { useIsMobile } from '@/hooks/useIsMobile';

interface EntryFormData {
  walletId: string;
  title: string;
  value: number;
  type: EntryType;
  description: string;
  category: Category;
  date: string;
}

function EntryFormDialog({
  open,
  onClose,
  wallets,
  defaultWalletId,
}: {
  open: boolean;
  onClose: () => void;
  wallets: { id: string; name: string }[];
  defaultWalletId?: string;
}) {
  const [form, setForm] = useState<EntryFormData>({
    walletId: defaultWalletId ?? wallets[0]?.id ?? '',
    title: '',
    value: 0,
    type: EntryType.Credit,
    description: '',
    category: Category.Salary,
    date: dayjs().format('YYYY-MM-DD'),
  });

  const createMutation = useCreateEntry();
  const { t } = useLanguage();

  const handleSubmit = () => {
    createMutation.mutate(form, { onSuccess: onClose });
  };

  const handleClose = () => {
    setForm({
      walletId: wallets[0]?.id ?? '',
      title: '',
      value: 0,
      type: EntryType.Credit,
      description: '',
      category: Category.Salary,
      date: dayjs().format('YYYY-MM-DD'),
    });
    onClose();
  };

  const handleTypeChange = (_: React.MouseEvent<HTMLElement>, newType: EntryType | null) => {
    if (newType !== null) {
      setForm({ ...form, type: newType });
    }
  };

  return (
    <ResponsiveFormDialog
      open={open}
      onClose={handleClose}
      title={t.entry.newEntry}
      actions={
        <>
          <Button onClick={handleClose}>{t.common.cancel}</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!form.walletId || !form.title || !form.value || createMutation.isPending}
          >
            {t.common.create}
          </Button>
        </>
      }
    >
      <FormControl fullWidth margin="normal">
        <InputLabel>{t.common.wallet}</InputLabel>
        <Select
          value={form.walletId}
          label={t.common.wallet}
          onChange={(e) => setForm({ ...form, walletId: e.target.value })}
        >
          {wallets.map((w) => (
            <MenuItem key={w.id} value={w.id}>
              {w.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ mb: 2, mt: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {t.common.type}
        </Typography>
        <ToggleButtonGroup value={form.type} exclusive onChange={handleTypeChange} fullWidth>
          <ToggleButton value={EntryType.Credit} color="success">
            {t.common.credit}
          </ToggleButton>
          <ToggleButton value={EntryType.Debit} color="error">
            {t.common.debit}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TextField
        fullWidth
        label={t.common.value}
        type="number"
        margin="normal"
        value={form.value || ''}
        onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
        slotProps={{ htmlInput: { min: 0 } }}
      />
      <TextField
        fullWidth
        label={t.common.title}
        margin="normal"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>{t.common.category}</InputLabel>
        <Select
          value={form.category}
          label={t.common.category}
          onChange={(e) => setForm({ ...form, category: Number(e.target.value) as Category })}
        >
          {Object.entries(CategoryLabels)
            .filter(([key]) => key !== '0')
            .map(([value, label]) => (
              <MenuItem key={value} value={Number(value)}>
                {label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
      <TextField
        fullWidth
        label={t.common.date}
        type="date"
        margin="normal"
        value={form.date}
        onChange={(e) => setForm({ ...form, date: e.target.value })}
        slotProps={{ inputLabel: { shrink: true } }}
      />
      <TextField
        fullWidth
        label={t.common.description}
        margin="normal"
        multiline
        rows={2}
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />
    </ResponsiveFormDialog>
  );
}

function EntryCard({
  entry,
  formatDate,
  onClick,
}: {
  entry: Entry;
  formatDate: (dateStr: string) => string;
  onClick: () => void;
}) {
  return (
    <Card
      sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {entry.type === EntryType.Credit ? (
                <TrendingUpIcon fontSize="small" color="success" />
              ) : (
                <TrendingDownIcon fontSize="small" color="error" />
              )}
              <Typography sx={{ fontWeight: 600 }} noWrap>
                {entry.title}
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {formatDate(entry.date)}
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
  const { t } = useLanguage();
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
          <Stack spacing={1.5}>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                formatDate={formatDate}
                onClick={() => navigate(`/wallets/${entry.walletId}`)}
              />
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