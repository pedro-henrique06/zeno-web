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
