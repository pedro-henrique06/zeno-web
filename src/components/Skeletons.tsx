import { Box, Paper, Skeleton } from '@mui/material';

/** Placeholder rows shaped like list items (entries, tags, balances, houses). */
export function ListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <Paper
      aria-busy="true"
      sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', boxShadow: 'none', overflow: 'hidden' }}
    >
      {Array.from({ length: rows }, (_, i) => (
        <Box
          key={i}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            px: 2,
            py: 1.5,
            borderTop: i === 0 ? 'none' : '1px solid',
            borderColor: 'divider',
          }}
        >
          <Skeleton variant="circular" width={36} height={36} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="55%" height={18} />
            <Skeleton width="30%" height={14} />
          </Box>
          <Skeleton width={64} height={20} />
        </Box>
      ))}
    </Paper>
  );
}

/** Placeholder matching the Dashboard: hero card, stat list and movements card. */
export function DashboardSkeleton() {
  return (
    <Box aria-busy="true">
      <Skeleton variant="rounded" height={170} sx={{ borderRadius: 4, mb: 2 }} />
      <Skeleton width={120} height={16} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" height={168} sx={{ borderRadius: 3, mb: 2.5 }} />
      <Skeleton variant="rounded" height={220} sx={{ borderRadius: 3 }} />
    </Box>
  );
}
