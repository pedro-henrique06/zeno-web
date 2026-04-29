import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#2F80ED' : '#1976d2',
        light: isDark ? '#4F9EFF' : '#42a5f5',
        dark: isDark ? '#1B6DD1' : '#1565c0',
      },
      secondary: {
        main: isDark ? '#9c27b0' : '#9c27b0',
        light: isDark ? '#ba68c8' : '#ba68c8',
        dark: isDark ? '#7b1fa2' : '#7b1fa2',
      },
      success: {
        main: isDark ? '#22C55E' : '#16A34A',
        light: isDark ? '#4ADE80' : '#22C55E',
        dark: isDark ? '#16A34A' : '#16A34A',
      },
      error: {
        main: isDark ? '#EF4444' : '#DC2626',
        light: isDark ? '#F87171' : '#EF4444',
        dark: isDark ? '#DC2626' : '#DC2626',
      },
      warning: {
        main: isDark ? '#F59E0B' : '#D97706',
        light: isDark ? '#FBBF24' : '#F59E0B',
        dark: isDark ? '#D97706' : '#D97706',
      },
      ...(isDark
        ? {
            background: {
              default: '#0B0F14',
              paper: '#151B23',
            },
            text: {
              primary: '#F9FAFB',
              secondary: '#9CA3AF',
            },
            divider: '#2A3441',
          }
        : {
            background: {
              default: '#F5F5F5',
              paper: '#FFFFFF',
            },
            text: {
              primary: '#111827',
              secondary: '#6B7280',
            },
            divider: '#E5E7EB',
          }),
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 600,
            borderRadius: 10,
            padding: '10px 20px',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: isDark ? '0 4px 12px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.08)',
            borderRadius: 16,
            padding: '20px 24px',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '20px 24px',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiInputBase: {
        styleOverrides: {
          root: {
            height: '48px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '16px',
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: isDark ? '#9CA3AF' : '#6B7280',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 16,
            padding: '8px',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '24px 24px 16px',
          },
        },
      },
      MuiDialogContent: {
        styleOverrides: {
          root: {
            padding: '16px 24px',
          },
        },
      },
      MuiDialogActions: {
        styleOverrides: {
          root: {
            padding: '16px 24px 24px',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            minHeight: '48px',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
          },
        },
      },
      MuiIconButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
          },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.875rem',
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            margin: '2px 4px',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved === 'dark' ? 'dark' : 'dark';
  });

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme-mode', next);
      return next;
    });
  }, []);

  useEffect(() => {
    document.documentElement.style.colorScheme = mode;
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeContextProvider');
  }
  return context;
}
