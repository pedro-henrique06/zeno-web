import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { brand, surfaces } from './tokens';

type Mode = 'light' | 'dark';
const KEY = 'zeno.theme';

/** SF Pro ('System') for interface text; Fraunces stays as the brand face for money only. */
export const fonts = {
  display: 'Fraunces_700Bold',
  body: 'System',
  medium: 'System',
  bold: 'System',
} as const;

export interface Palette {
  mode: Mode;
  page: string;
  paper: string;
  raised: string;
  divider: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  hover: string;
  /** Tinted gray fill for secondary buttons, segmented track and chips. */
  fill: string;
  nav: string;
  auth: string;
  /** Income/expense/projection text on page or paper. On navy cards keep using `brand.*`. */
  income: string;
  expense: string;
  teal: string;
}

interface ThemeContextType {
  mode: Mode;
  colors: Palette;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function paletteFor(mode: Mode): Palette {
  const s = surfaces[mode];
  return {
    mode,
    page: s.page,
    paper: s.paper,
    raised: s.raised,
    divider: s.divider,
    text: s.textPrimary,
    textSecondary: s.textSecondary,
    textDisabled: s.textDisabled,
    hover: s.hover,
    fill: s.fill,
    nav: s.nav,
    auth: s.auth,
    income: s.income,
    expense: s.expense,
    teal: s.teal,
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<Mode | null>(null);

  useEffect(() => {
    SecureStore.getItemAsync(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark') setOverride(v);
      })
      .catch(() => {});
  }, []);

  const mode: Mode = override ?? (system === 'light' ? 'light' : 'dark');

  const toggleTheme = useCallback(() => {
    const next: Mode = mode === 'dark' ? 'light' : 'dark';
    setOverride(next);
    SecureStore.setItemAsync(KEY, next).catch(() => {});
  }, [mode]);

  const value = useMemo(() => ({ mode, colors: paletteFor(mode), toggleTheme }), [mode, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}

export { brand };
