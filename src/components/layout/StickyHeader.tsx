import { Box, type SxProps, type Theme } from '@mui/material';
import type { ReactNode } from 'react';

export function StickyHeader({ children, sx }: { children: ReactNode; sx?: SxProps<Theme> }) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 2,
        bgcolor: 'background.default',
        mx: -2,
        mt: 'calc(-16px - env(safe-area-inset-top, 0px))',
        px: 2,
        pt: 'calc(16px + env(safe-area-inset-top, 0px))',
        pb: 1,
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
