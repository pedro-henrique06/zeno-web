import { useState } from 'react';
import { Box, Typography, Paper, Avatar, Button, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSummary } from '@/hooks/useSummary';
import { formatCurrency } from '@/utils/currency';
import { EntryKind } from '@/types';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EntryKindColors, EntryKindLetters } from '@/utils/entryKind';

function StatCard({
  label,
  value,
  subLabel,
  subColor,
}: {
  label: string;
  value: string;
  subLabel: string;
  subColor: 'success.main' | 'error.main' | 'text.secondary';
}) {
  return (
    <Paper sx={{ p: 2, borderRadius: 3 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {value}
      </Typography>
      <Typography variant="caption" sx={{ color: subColor, fontWeight: 600 }}>
        {subLabel}
      </Typography>
    </Paper>
  );
}

function MovementRow({
  kind,
  label,
  total,
}: {
  kind: number;
  label: string;
  total: number;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1.25 }}>
      <Avatar sx={{ bgcolor: EntryKindColors[kind as 0 | 1 | 2 | 3 | 4], width: 36, height: 36, fontSize: 14, fontWeight: 700 }}>
        {EntryKindLetters[kind as 0 | 1 | 2 | 3 | 4]}
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontWeight: 600 }} noWrap>
          {label}
        </Typography>
      </Box>
      <Typography sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>
        {formatCurrency(total)}
      </Typography>
    </Box>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, isError } = useSummary(month, year);

  if (isError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Typography color="error">Não foi possível carregar o resumo. Tente novamente.</Typography>
      </Box>
    );
  }

  if (isLoading || !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const { performance, economizedPercent, costOfLiving, dailyAverageReal, movements } = data;

  return (
    <Box>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      <Typography variant="overline" color="text.secondary" sx={{ pl: 0.5, fontWeight: 700 }}>
        Cálculos do mês
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 2, mb: 4, mt: 1 }}>
        <StatCard
          label="Performance"
          value={formatCurrency(performance)}
          subLabel={performance >= 0 ? 'Sobrou dinheiro' : 'Faltou dinheiro'}
          subColor={performance >= 0 ? 'success.main' : 'error.main'}
        />
        <StatCard
          label="Economizado"
          value={`${economizedPercent.toFixed(1)}%`}
          subLabel={economizedPercent > 0 ? 'Economizado' : 'Nada economizado'}
          subColor={economizedPercent > 0 ? 'success.main' : 'text.secondary'}
        />
        <StatCard
          label="Custo de vida"
          value={formatCurrency(costOfLiving)}
          subLabel="Custo de vida"
          subColor="text.secondary"
        />
        <StatCard
          label="Diário médio"
          value={formatCurrency(dailyAverageReal)}
          subLabel="Diário médio"
          subColor="text.secondary"
        />
      </Box>

      <Paper sx={{ borderRadius: 3, p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Movimentações do mês
          </Typography>
          <Button size="small" onClick={() => navigate('/entries')}>
            Ver todas
          </Button>
        </Box>

        <MovementRow kind={EntryKind.Entrada} label="Entradas" total={movements.entrada} />
        <MovementRow kind={EntryKind.Saida} label="Saídas" total={movements.saida} />
        <MovementRow kind={EntryKind.Diario} label="Diários" total={movements.diario} />
        <MovementRow kind={EntryKind.Economia} label="Economias" total={movements.economia} />
        <MovementRow kind={EntryKind.Cartao} label="Gastos com cartão" total={movements.cartao} />
      </Paper>
    </Box>
  );
}
