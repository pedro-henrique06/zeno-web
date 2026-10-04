import type { ReactNode } from 'react';
import { Box, Button, Container, TextField, Typography, type ButtonProps, type TextFieldProps } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { brand } from '@/theme/tokens';

const FRAUNCES = '"Fraunces", serif';

/** Editorial layout shared by login and register: wordmark, big italic title, form, footer. */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'background.default' : '#F7F5F0',
        py: { xs: 4, sm: 8 },
      }}
    >
      <Container maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' }}>
        <Typography sx={{ fontFamily: FRAUNCES, fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.3px' }}>
          Zeno<Box component="span" sx={{ color: brand.blue }}>.</Box>
        </Typography>

        <Typography
          component="h1"
          sx={{
            fontFamily: FRAUNCES,
            fontWeight: 300,
            fontStyle: 'italic',
            fontSize: { xs: '2.4rem', sm: '2.8rem' },
            lineHeight: 1.02,
            letterSpacing: '-1px',
            mt: 5,
            mb: subtitle ? 1 : 4,
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography sx={{ color: 'text.secondary', fontSize: '0.95rem', mb: 3 }}>{subtitle}</Typography>
        )}

        {children}

        <Box sx={{ mt: 'auto', pt: 4, textAlign: 'center', fontSize: '0.875rem', color: 'text.secondary' }}>
          {footer}
        </Box>
      </Container>
    </Box>
  );
}

/** Underline-only text field used on the auth screens. */
export function AuthTextField(props: TextFieldProps) {
  return (
    <TextField
      variant="standard"
      fullWidth
      margin="normal"
      {...props}
      sx={{
        '& .MuiInputBase-root': { fontSize: '1rem' },
        '& .MuiInputLabel-root': { fontWeight: 600, letterSpacing: '.02em' },
        '& .MuiInput-underline:before': { borderBottomWidth: 1.5, borderBottomColor: 'text.primary' },
        '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: 'text.primary' },
        '& .MuiInput-underline:after': { borderBottomColor: brand.blue, borderBottomWidth: 2 },
        '& .MuiInputLabel-root.Mui-focused': { color: brand.blue },
        ...(props.sx as object),
      }}
    />
  );
}

/** Pill primary action with an arrow badge. */
export function AuthSubmitButton({ children, ...props }: ButtonProps) {
  return (
    <Button
      type="submit"
      fullWidth
      size="large"
      {...props}
      sx={{
        mt: 3,
        height: 54,
        borderRadius: 999,
        justifyContent: 'space-between',
        pl: 3,
        pr: 1,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? '#EAF0F7' : '#14233A',
        color: (theme) => theme.palette.mode === 'dark' ? '#0B1A2C' : '#FFFFFF',
        '&:hover': { bgcolor: (theme) => theme.palette.mode === 'dark' ? '#FFFFFF' : '#0D1828' },
        '&.Mui-disabled': { opacity: 0.6, color: (theme) => theme.palette.mode === 'dark' ? '#0B1A2C' : '#FFFFFF' },
        ...(props.sx as object),
      }}
    >
      {children}
      <Box
        component="span"
        sx={{ width: 38, height: 38, borderRadius: '50%', bgcolor: brand.blue, color: '#0B1A2C', display: 'grid', placeItems: 'center' }}
      >
        <ArrowForwardIcon fontSize="small" />
      </Box>
    </Button>
  );
}

/** Quiet secondary pill (Google). */
export function AuthSecondaryButton(props: ButtonProps) {
  return (
    <Button
      variant="outlined"
      fullWidth
      size="large"
      {...props}
      sx={{
        mt: 1.5,
        height: 50,
        borderRadius: 999,
        color: 'text.primary',
        borderColor: 'divider',
        fontWeight: 500,
        ...(props.sx as object),
      }}
    />
  );
}
