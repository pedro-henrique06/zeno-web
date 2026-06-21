import { useState } from 'react';
import {
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useBalances } from '@/hooks/useBalances';
import { formatCurrency } from '@/utils/currency';
import { MonthSwitcher } from '@/components/MonthSwitcher';

export default function BalancesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  const { data, isLoading, isError } = useBalances(month, year);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography color="error">Não foi possível carregar os saldos. Tente novamente.</Typography>
      </Box>
    );
  }

  const days = data?.days ?? [];

  return (
    <Box>
      <MonthSwitcher month={month} year={year} onChange={(m, y) => { setMonth(m); setYear(y); }} />

      <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Dia</TableCell>
              <TableCell align="right">Diário</TableCell>
              <TableCell align="right">Saldos</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {days.map((day) => {
              const rowSx = day.isProjected
                ? { bgcolor: '#FCE4EC', '& .MuiTableCell-root': { color: '#C2185B' } }
                : { bgcolor: '#FFF9C4', '& .MuiTableCell-root': { color: '#000' } };
              return (
                <TableRow key={day.day} sx={rowSx}>
                  <TableCell>{day.day}</TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {day.diario > 0 ? formatCurrency(day.diario) : '-'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {formatCurrency(day.balance)}
                    </Typography>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
