import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material';
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import { useWallets } from '@/hooks/useWallets';
import { useHomes } from '@/hooks/useHomes';
import { useEntries } from '@/hooks/useEntries';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/currency';
import { EntryType, CategoryLabels } from '@/types';

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'primary' | 'success' | 'error';
}

function SummaryCard({ title, value, icon, color }: SummaryCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${color}.main`,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
        <Typography variant="h4" sx={{ fontWeight: 700 }} color={`${color}.main`}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface WalletCardProps {
  name: string;
  balance: number;
  currency: string;
  onClick: () => void;
}

function WalletCard({ name, balance, currency, onClick }: WalletCardProps) {
  return (
    <Card sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }} onClick={onClick}>
      <CardContent>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          {name}
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {formatCurrency(balance, currency)}
        </Typography>
      </CardContent>
    </Card>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
}

function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
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
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
        {actionLabel}
      </Button>
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { user } = useAuth();
  const { data: wallets, isLoading: walletsLoading } = useWallets();
  const { data: homes, isLoading: homesLoading } = useHomes();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthName = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  const walletIds = wallets?.map(w => w.id) ?? [];
  const { data: entries } = useEntries(currentMonth, currentYear, walletIds[0] ?? '');

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;

  const totalIncome = entries?.filter(e => e.type === EntryType.Credit).reduce((sum, e) => sum + e.value, 0) ?? 0;
  const totalExpense = entries?.filter(e => e.type === EntryType.Debit).reduce((sum, e) => sum + e.value, 0) ?? 0;
  const remaining = totalIncome - totalExpense;

  const expenseByCategory = entries
    ?.filter(e => e.type === EntryType.Debit)
    .reduce((acc, entry) => {
      const catLabel = CategoryLabels[entry.category] || 'Outros';
      const existing = acc.find(a => a.label === catLabel);
      if (existing) {
        existing.value += entry.value;
      } else {
        acc.push({ label: catLabel, value: entry.value });
      }
      return acc;
    }, [] as { label: string; value: number }[]) ?? [];

  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    last6Months.push({
      month: d.toLocaleDateString('pt-BR', { month: 'short' }),
    });
  }

  const monthlyData = [
    { month: 'Jan', receitas: 0, despesas: 0 },
    { month: 'Fev', receitas: 0, despesas: 0 },
    { month: 'Mar', receitas: 0, despesas: 0 },
    { month: 'Abr', receitas: 0, despesas: 0 },
    { month: 'Mai', receitas: 0, despesas: 0 },
    { month: 'Jun', receitas: 0, despesas: 0 },
  ];
  monthlyData[5] = { month: 'Jun', receitas: totalIncome, despesas: totalExpense };

  if (walletsLoading || homesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const chartColors = ['#2F80ED', '#22C55E', '#F59E0B', '#EF4444', '#9CA3AF', '#8B5CF6', '#EC4899'];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
          {t.dashboard.greeting}, {user?.name ?? ''}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Resumo de {monthName}
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={t.dashboard.totalBalance}
            value={formatCurrency(totalBalance)}
            icon={<AccountBalanceWalletIcon />}
            color="primary"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={t.dashboard.incomeThisMonth}
            value={formatCurrency(totalIncome)}
            icon={<TrendingUpIcon />}
            color="success"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={t.dashboard.expensesThisMonth}
            value={formatCurrency(totalExpense)}
            icon={<TrendingDownIcon />}
            color="error"
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SummaryCard
            title={t.dashboard.remainingThisMonth}
            value={formatCurrency(remaining)}
            icon={<AccountBalanceWalletIcon />}
            color={remaining >= 0 ? 'primary' : 'error'}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Despesas por Categoria
              </Typography>
              {expenseByCategory.length > 0 ? (
                <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
                  <PieChart
                    series={[
                      {
                        data: expenseByCategory.map((item, index) => ({
                          value: item.value,
                          label: item.label,
                          color: chartColors[index % chartColors.length],
                        })),
                        innerRadius: 50,
                        outerRadius: 100,
                      },
                    ]}
                    height={250}
                    width={350}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma despesa registrada este mês
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Receitas x Despesas
              </Typography>
              <Box sx={{ height: 250 }}>
                <BarChart
                  xAxis={[{ data: monthlyData.map(m => m.month), scaleType: 'band' }]}
                  series={[
                    { data: monthlyData.map(m => m.receitas), label: 'Receitas', color: '#22C55E' },
                    { data: monthlyData.map(m => m.despesas), label: 'Despesas', color: '#EF4444' },
                  ]}
                  height={250}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t.dashboard.myWallets}
                </Typography>
                <Button size="small" onClick={() => navigate('/wallets')}>
                  {t.dashboard.viewAll}
                </Button>
              </Box>
              {wallets && wallets.length > 0 ? (
                <Grid container spacing={2}>
                  {wallets.slice(0, 3).map((wallet) => (
                    <Grid size={{ xs: 12 }} key={wallet.id}>
                      <WalletCard
                        name={wallet.name}
                        balance={wallet.balance}
                        currency={wallet.currency}
                        onClick={() => navigate(`/wallets/${wallet.id}`)}
                      />
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="Você ainda não criou nenhuma carteira"
                  description="Crie sua primeira carteira para começar a organizar seu dinheiro."
                  actionLabel={t.wallet.newWallet}
                  onAction={() => navigate('/wallets')}
                />
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t.dashboard.myHomes}
                </Typography>
                <Button size="small" onClick={() => navigate('/homes')}>
                  {t.dashboard.viewAll}
                </Button>
              </Box>
              {homes && homes.length > 0 ? (
                <Grid container spacing={2}>
                  {homes.slice(0, 3).map((home) => (
                    <Grid size={{ xs: 12 }} key={home.id}>
                      <Card
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => navigate(`/homes/${home.id}`)}
                      >
                        <CardContent>
                          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            {home.description || ''}
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {home.name}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <EmptyState
                  title="Nenhuma casa ainda"
                  description="Crie uma casa para compartilhar despesas com sua família."
                  actionLabel={t.home.newHome}
                  onAction={() => navigate('/homes')}
                />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}