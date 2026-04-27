import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@mui/material/styles'
import { CssBaseline } from '@mui/material'
import { AuthProvider } from '@/contexts/AuthContext'
import { LanguageProvider } from '@/i18n/LanguageContext'
import { ThemeContextProvider, useThemeContext } from '@/theme/ThemeContext'
import AppRoutes from '@/routes'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function ThemeBridge({ children }: { children: React.ReactNode }) {
  const { theme } = useThemeContext();
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeContextProvider>
          <AuthProvider>
            <ThemeBridge>
              <AppRoutes />
            </ThemeBridge>
          </AuthProvider>
        </ThemeContextProvider>
      </LanguageProvider>
    </QueryClientProvider>
  </StrictMode>,
)
