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
  /** Filled controls with white text/icons (CTA buttons, FAB): 4.7:1 against white. */
  blueAction: '#2378BD',

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

  /** Text on any filled semantic color above (chips, badges): ≥4.4:1 on all of them, where white fails. */
  ink: '#0B111B',
} as const;

export type BrandColor = keyof typeof brand;

/**
 * Neutral surfaces and text per color mode, after iOS system colours (systemGroupedBackground,
 * secondarySystemGroupedBackground, separator, label…), with secondary text nudged to keep 4.5:1.
 */
export const surfaces = {
  light: {
    page: '#F2F2F7',
    paper: '#FFFFFF',
    raised: '#FFFFFF',
    divider: '#D8D8DC',
    textPrimary: '#000000',
    textSecondary: '#6C6C70',
    textDisabled: '#707076',
    hover: 'rgba(0,0,0,0.04)',
    /** iOS tertiarySystemFill: tinted buttons, segmented track, chips. */
    fill: 'rgba(118,118,128,0.12)',
    nav: 'rgba(255,255,255,0.97)',
    /** Background of the login / register screens. */
    auth: '#F2F2F7',
    /** Semantic text on page/paper: darker than the brand hues to keep 4.5:1. */
    income: '#137A45',
    expense: '#C2412B',
    teal: '#1F7A77',
  },
  dark: {
    page: '#000000',
    paper: '#1C1C1E',
    raised: '#2C2C2E',
    divider: '#38383A',
    textPrimary: '#FFFFFF',
    textSecondary: '#98989F',
    textDisabled: '#8D8D93',
    hover: 'rgba(255,255,255,0.06)',
    fill: 'rgba(118,118,128,0.24)',
    nav: 'rgba(28,28,30,0.97)',
    auth: '#000000',
    income: brand.income,
    expense: brand.expense,
    teal: brand.teal,
  },
} as const;
