import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Design tokens
const C = {
  // Backgrounds
  bgPage: '#F2F2F7',
  bgPaper: '#FFFFFF',
  bgDark: '#1B2D48',      // dark navy card
  bgDarkSurface: '#243B58',

  // Brand
  blue: '#4A9FE0',         // CTA / active
  teal: '#5ECCC8',         // projected / future
  green: '#2DC579',        // income / positive
  salmon: '#E86B52',       // expenses / negative
  orange: '#F0A030',
  purple: '#8B5CF6',

  // Text on light bg
  textPrimary: '#1C1C1E',
  textSecondary: '#8E8E93',
  textDisabled: '#AEAEB2',

  // Text on dark bg
  darkTextPrimary: '#FFFFFF',
  darkTextSecondary: 'rgba(255,255,255,0.65)',

  // Dividers
  dividerLight: '#E5E5EA',
} as const;

function getTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: C.blue,
        light: '#6EB7EA',
        dark: '#2D85CC',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: C.teal,
        light: '#80DEDA',
        dark: '#3EB5B1',
        contrastText: '#FFFFFF',
      },
      success: {
        main: C.green,
        light: '#5DD99A',
        dark: '#1EA85F',
        contrastText: '#FFFFFF',
      },
      error: {
        main: C.salmon,
        light: '#EF907B',
        dark: '#CB4D35',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: C.orange,
        light: '#F5BC5C',
        dark: '#CC841A',
        contrastText: '#FFFFFF',
      },
      ...(isDark
        ? {
            background: {
              default: '#0F1623',
              paper: '#1A2438',
            },
            text: {
              primary: '#F0F4F8',
              secondary: '#9DAFC5',
            },
            divider: '#2A3C54',
          }
        : {
            background: {
              default: C.bgPage,
              paper: C.bgPaper,
            },
            text: {
              primary: C.textPrimary,
              secondary: C.textSecondary,
            },
            divider: C.dividerLight,
          }),
    },
    typography: {
      fontFamily: '"DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
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
            boxShadow: isDark ? '0 4px 16px rgba(0,0,0,0.4)' : '0 1px 4px rgba(28,28,30,0.06)',
            borderRadius: 16,
            border: isDark ? '1px solid rgba(255,255,255,0.06)' : `1px solid ${C.dividerLight}`,
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '16px 20px',
            '&:last-child': { paddingBottom: '16px' },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.3)' : '0 1px 4px rgba(28,28,30,0.06)',
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
          multiline: {
            height: 'auto',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderColor: isDark ? '#2A3C54' : C.dividerLight,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: isDark ? '#9DAFC5' : C.textSecondary,
              backgroundColor: isDark ? '#1A2438' : C.bgPage,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.025)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            backgroundImage: 'none',
          },
        },
      },
      MuiDialogTitle: {
        styleOverrides: {
          root: {
            padding: '24px 24px 16px',
            fontSize: '1.25rem',
            fontWeight: 600,
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
            fontSize: '0.95rem',
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 3,
            borderRadius: 3,
            backgroundColor: C.blue,
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
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 4,
            height: 8,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: isDark ? '#2A3C54' : C.dividerLight,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(26,36,56,0.97)' : 'rgba(255,255,255,0.97)',
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: C.blue,
            },
            color: isDark ? '#9DAFC5' : C.textSecondary,
          },
        },
      },
    },
  });
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved === 'dark' ? 'dark' : 'light';
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
