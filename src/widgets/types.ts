/**
 * Props pushed by the app to the home-screen widgets. Everything is pre-formatted text:
 * the widget runtime has no i18n, Intl formatting or access to the app's state.
 */
export interface TodayWidgetProps {
  /** false while signed out or before the first sync: the widget shows `emptyText`. */
  ready: boolean;
  emptyText: string;
  todayLabel: string;
  todayValue: string;
  todayNegative: boolean;
  /** e.g. "R$ 30,00 de R$ 100,00 gastos". */
  spentLine: string;
  monthLabel: string;
  monthValue: string;
  monthNegative: boolean;
}

export interface GoalWidgetProps {
  ready: boolean;
  /** Signed in but without a goal: shows `emptyText` too. */
  hasGoal: boolean;
  emptyText: string;
  title: string;
  name: string;
  percentText: string;
  /** 0..1 */
  progress: number;
  /** e.g. "R$ 38.000 de R$ 100.000". */
  amountsLine: string;
}
