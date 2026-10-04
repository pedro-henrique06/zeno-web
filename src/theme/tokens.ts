/**
 * Single source of truth for the brand/semantic colors used outside the MUI
 * palette (charts, inline `sx`, avatars). Import from here instead of
 * hardcoding hex values in components.
 */
export const brand = {
  /** Dark navy hero cards (daily budget, balances stats, goal result). */
  navy: '#1B2D48',
  navySurface: '#243B58',

  /** Primary accent: CTAs, active nav, today marker. */
  blue: '#4A9FE0',
  blueLight: '#6EB7EA',
  blueDark: '#2D85CC',

  /** Projected / future values. */
  teal: '#5ECCC8',
  tealLight: '#80DEDA',
  tealDark: '#3EB5B1',

  /** Semantic: money in / positive. */
  income: '#2DC579',
  incomeLight: '#5DD99A',
  incomeDark: '#1EA85F',

  /** Semantic: money out / negative. */
  expense: '#E86B52',
  expenseLight: '#EF907B',
  expenseDark: '#CB4D35',

  /** Semantic: attention (e.g. mid-range goal horizon). */
  warning: '#F0A030',
  warningLight: '#F5BC5C',
  warningDark: '#CC841A',

  /** Credit card kind / avatar palette. */
  purple: '#8B5CF6',
} as const;

export type BrandColor = keyof typeof brand;

/** Neutral surfaces and text per color mode. Dark is layered: page < paper < raised. */
export const surfaces = {
  light: {
    page: '#F2F2F7',
    paper: '#FFFFFF',
    raised: '#FFFFFF',
    divider: '#E5E5EA',
    textPrimary: '#1C1C1E',
    textSecondary: '#6E6E73',
    textDisabled: '#8A8A92',
    hover: 'rgba(0,0,0,0.025)',
    nav: 'rgba(255,255,255,0.97)',
  },
  dark: {
    page: '#0B111B',
    paper: '#141D2D',
    raised: '#1B2638',
    divider: '#243248',
    textPrimary: '#EAF0F7',
    textSecondary: '#93A4BA',
    textDisabled: '#7A8CA3',
    hover: 'rgba(255,255,255,0.04)',
    nav: 'rgba(20,29,45,0.97)',
  },
} as const;
