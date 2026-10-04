import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';
import { brand, surfaces } from './tokens';

interface ThemeContextType {
  mode: 'light' | 'dark';
  toggleTheme: () => void;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

// Design tokens
const C = {
  bgDark: brand.navy,     // dark navy card
  bgDarkSurface: brand.navySurface,

  // Brand
  blue: brand.blue,         // CTA / active
  teal: brand.teal,         // projected / future
  green: brand.income,        // income / positive
  salmon: brand.expense,       // expenses / negative
  orange: brand.warning,
  purple: brand.purple,

} as const;

function getTheme(mode: 'light' | 'dark'): Theme {
  const isDark = mode === 'dark';
  const n = surfaces[mode];

  return createTheme({
    palette: {
      mode,
      primary: {
        main: C.blue,
        light: brand.blueLight,
        dark: brand.blueDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: C.teal,
        light: brand.tealLight,
        dark: brand.tealDark,
        contrastText: '#FFFFFF',
      },
      success: {
        main: C.green,
        light: brand.incomeLight,
        dark: brand.incomeDark,
        contrastText: '#FFFFFF',
      },
      error: {
        main: C.salmon,
        light: brand.expenseLight,
        dark: brand.expenseDark,
        contrastText: '#FFFFFF',
      },
      warning: {
        main: C.orange,
        light: brand.warningLight,
        dark: brand.warningDark,
        contrastText: '#FFFFFF',
      },
      background: { default: n.page, paper: n.paper },
      text: { primary: n.textPrimary, secondary: n.textSecondary, disabled: n.textDisabled },
      divider: n.divider,
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
      MuiButtonBase: {
        styleOverrides: {
          root: {
            '&.Mui-focusVisible': {
              outline: `2px solid ${brand.blue}`,
              outlineOffset: 2,
            },
          },
        },
      },
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
            border: `1px solid ${n.divider}`,
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
            minHeight: '48px',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '12px 16px',
            borderColor: n.divider,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              color: n.textSecondary,
              backgroundColor: n.page,
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: n.hover,
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
          sizeSmall: {
            minWidth: 36,
            minHeight: 36,
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
            borderColor: n.divider,
          },
        },
      },
      MuiBottomNavigation: {
        styleOverrides: {
          root: {
            backgroundColor: n.nav,
          },
        },
      },
      MuiBottomNavigationAction: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: C.blue,
            },
            color: n.textSecondary,
          },
        },
      },
    },
  });
}

export function ThemeContextProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', surfaces[mode].page);
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
