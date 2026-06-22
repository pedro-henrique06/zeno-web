import { Box, IconButton, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useProfile } from '@/hooks/useUser';
import { LANGUAGE_LOCALES } from '@/utils/currency';

interface MonthSwitcherProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
  endAdornment?: React.ReactNode;
}

export function MonthSwitcher({ month, year, onChange, endAdornment }: MonthSwitcherProps) {
  const { data: profile } = useProfile();
  const date = new Date(year, month - 1, 1);
  const label = new Intl.DateTimeFormat(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], {
    month: 'short',
    year: '2-digit',
  }).format(date);

  const shift = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1);
    onChange(next.getMonth() + 1, next.getFullYear());
  };

  const today = new Date();

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
      <Box
        onClick={() => onChange(today.getMonth() + 1, today.getFullYear())}
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
        }}
      >
        <Typography sx={{ fontWeight: 700, fontSize: 14, color: 'text.secondary', lineHeight: 1 }}>
          {today.getDate()}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <IconButton size="small" onClick={() => shift(-1)}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, minWidth: 90, textAlign: 'center', textTransform: 'capitalize' }}>
          {label}
        </Typography>
        <IconButton size="small" onClick={() => shift(1)}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box sx={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {endAdornment}
      </Box>
    </Box>
  );
}
