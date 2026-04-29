import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
  Button,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useWallets } from '@/hooks/useWallets';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatCurrency } from '@/utils/currency';

export default function ReportsPage() {
  const { t } = useLanguage();
  const { data: wallets, isLoading } = useWallets();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const totalBalance = wallets?.reduce((sum, w) => sum + w.balance, 0) ?? 0;

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Relatórios
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Visão Geral - Últimos 6 meses
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Adicione lançamentos para ver os relatórios
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Resumo por Categoria
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Nenhuma despesa registrada
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Saldo por Carteira
              </Typography>
              {wallets && wallets.length > 0 ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {wallets.map((wallet) => (
                    <Box
                      key={wallet.id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 2,
                        bgcolor: 'background.default',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {wallet.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 700, color: 'primary.main' }}
                      >
                        {formatCurrency(wallet.balance, wallet.currency)}
                      </Typography>
                    </Box>
                  ))}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      p: 2,
                      bgcolor: 'action.selected',
                      borderRadius: 2,
                      borderTop: '2px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Total
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{ fontWeight: 700, color: 'success.main' }}
                    >
                      {formatCurrency(totalBalance)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography color="text.secondary">
                    Nenhuma carteira cadastrada
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}