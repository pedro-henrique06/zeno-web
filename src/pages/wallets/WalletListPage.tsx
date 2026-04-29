import { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Collapse,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import { useNavigate } from 'react-router-dom';
import { useWallets } from '@/hooks/useWallets';
import { useAccounts, useCreateAccount, useDeleteAccount } from '@/hooks/useAccounts';
import type { Wallet, Account, CreateAccountRequest } from '@/types';
import { AccountTypeLabels } from '@/types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

interface AccountFormDialogProps {
  open: boolean;
  onClose: () => void;
  walletId: string;
  account?: Account | null;
}

function AccountFormDialog({ open, onClose, walletId, account }: AccountFormDialogProps) {
  const [name, setName] = useState(account?.name ?? '');
  const [bank, setBank] = useState(account?.bank ?? '');
  const [type, setType] = useState(account?.type ?? 'checking');
  const createMutation = useCreateAccount();
  const { t } = useLanguage();

  const handleSubmit = () => {
    const data: CreateAccountRequest = { name, bank, type, walletId };
    createMutation.mutate(data, { onSuccess: onClose });
  };

  const handleClose = () => {
    setName('');
    setBank('');
    setType('checking');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Nova Conta</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Nome da conta"
          margin="normal"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Conta Corrente Nubank"
        />
        <TextField
          fullWidth
          label="Banco"
          margin="normal"
          value={bank}
          onChange={(e) => setBank(e.target.value)}
          placeholder="Ex: Nubank, Inter, CEF"
        />
        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo</InputLabel>
          <Select
            value={type}
            label="Tipo"
            onChange={(e) => setType(e.target.value)}
          >
            <MenuItem value="checking">Conta Corrente</MenuItem>
            <MenuItem value="savings">Poupança</MenuItem>
            <MenuItem value="investment">Investimento</MenuItem>
            <MenuItem value="credit">Cartão de Crédito</MenuItem>
            <MenuItem value="other">Outros</MenuItem>
          </Select>
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t.common.cancel}</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!name || createMutation.isPending}
        >
          {t.common.create}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

interface WalletGroupProps {
  wallet: Wallet;
  accounts: Account[];
  onAddAccount: () => void;
  onDeleteAccount: (id: string) => void;
}

function WalletGroup({ wallet, accounts, onAddAccount, onDeleteAccount }: WalletGroupProps) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();

  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <AccountBalanceIcon color="primary" />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {wallet.name}
              </Typography>
              {wallet.description && (
                <Typography variant="body2" color="text.secondary">
                  {wallet.description}
                </Typography>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">
                {t.wallet.currentBalance}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }} color="primary.main">
                {formatCurrency(totalBalance, wallet.currency)}
              </Typography>
            </Box>
            <IconButton size="small">
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        <Collapse in={expanded}>
          <Divider sx={{ my: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="subtitle2" color="text.secondary">
              {accounts.length} conta(s)
            </Typography>
            <Button size="small" startIcon={<AddIcon />} onClick={(e) => { e.stopPropagation(); onAddAccount(); }}>
              Nova Conta
            </Button>
          </Box>

          {accounts.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {accounts.map((account) => (
                <Box
                  key={account.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {account.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {account.bank || 'Banco não informado'} • {AccountTypeLabels[account.type] || account.type}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }} color="primary.main">
                      {formatCurrency(account.balance, wallet.currency)}
                    </Typography>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDeleteAccount(account.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3, bgcolor: 'background.default', borderRadius: 2 }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                Nenhuma conta nesta carteira
              </Typography>
              <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={onAddAccount}>
                Adicionar conta
              </Button>
            </Box>
          )}
        </Collapse>
      </CardContent>
    </Card>
  );
}

export default function WalletListPage() {
  const [accountDialogOpen, setAccountDialogOpen] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [deleteAccountConfirm, setDeleteAccountConfirm] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: allAccounts } = useAccounts();
  const deleteAccountMutation = useDeleteAccount();

  const getAccountsByWallet = (walletId: string) => {
    return allAccounts?.filter(acc => acc.walletId === walletId) ?? [];
  };

  const handleAddAccount = (walletId: string) => {
    setSelectedWalletId(walletId);
    setAccountDialogOpen(true);
  };

  const handleDeleteAccount = (accountId: string) => {
    setDeleteAccountConfirm(accountId);
  };

  const confirmDeleteAccount = () => {
    if (deleteAccountConfirm) {
      deleteAccountMutation.mutate(deleteAccountConfirm, {
        onSuccess: () => setDeleteAccountConfirm(null),
      });
    }
  };

  if (walletsLoading) {
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
          {t.wallet.title}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/wallets')}
        >
          {t.wallet.newWallet}
        </Button>
      </Box>

      {wallets && wallets.length > 0 ? (
        wallets.map((wallet) => (
          <WalletGroup
            key={wallet.id}
            wallet={wallet}
            accounts={getAccountsByWallet(wallet.id)}
            onAddAccount={() => handleAddAccount(wallet.id)}
            onDeleteAccount={handleDeleteAccount}
          />
        ))
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
            Você ainda não criou nenhuma carteira
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Crie sua primeira carteira para começar a organizar suas contas.
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/wallets')}>
            {t.wallet.newWallet}
          </Button>
        </Box>
      )}

      <AccountFormDialog
        open={accountDialogOpen}
        onClose={() => {
          setAccountDialogOpen(false);
          setSelectedWalletId('');
        }}
        walletId={selectedWalletId}
      />

      <Dialog open={!!deleteAccountConfirm} onClose={() => setDeleteAccountConfirm(null)}>
        <DialogTitle>Excluir Conta</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir esta conta? Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountConfirm(null)}>{t.common.cancel}</Button>
          <Button
            onClick={confirmDeleteAccount}
            color="error"
            variant="contained"
            disabled={deleteAccountMutation.isPending}
          >
            {t.common.delete}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}