import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { getCalendars } from 'expo-localization';
import { getMyWidgetSummary, type WidgetSummary } from '@/api/widget';
import { useAuth } from '@/contexts/AuthContext';
import i18n, { LANGUAGE_TO_I18N } from '@/i18n';
import { formatCurrency } from '@/utils/currency';
import GoalWidget from './GoalWidget';
import TodayWidget from './TodayWidget';
import { WIDGET_SUMMARY_KEY } from './queryKey';

function deviceTimeZone(): string {
  return getCalendars()[0]?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function pushSignedOut() {
  const emptyText = i18n.t('widget.native.signedOut');
  TodayWidget.updateSnapshot({ ready: false, emptyText });
  GoalWidget.updateSnapshot({ ready: false, hasGoal: false, emptyText });
}

function pushSummary(summary: WidgetSummary) {
  // The widget follows the account's language and currency, like the rest of the app.
  const t = i18n.getFixedT(LANGUAGE_TO_I18N[summary.language] ?? i18n.language);
  const money = (value: number) => formatCurrency(value, summary.currency, summary.language);
  const goal = summary.goal;

  TodayWidget.updateSnapshot({
    ready: true,
    emptyText: '',
    todayLabel: t('widget.native.today'),
    todayValue: money(summary.availableToday),
    todayNegative: summary.availableToday < 0,
    spentLine: t('widget.native.spent', { spent: money(summary.spentToday), budget: money(summary.dailyBudget) }),
    monthLabel: t('widget.native.month'),
    monthValue: money(summary.monthBalance),
    monthNegative: summary.monthBalance < 0,
  });

  GoalWidget.updateSnapshot({
    ready: true,
    hasGoal: !!goal,
    emptyText: t('widget.native.noGoal'),
    title: t('widget.native.goal'),
    name: goal?.name ?? '',
    percentText: goal ? `${Math.round(goal.progressPercent)}%` : '',
    progress: goal ? Math.min(Math.max(goal.progressPercent / 100, 0), 1) : 0,
    amountsLine: goal
      ? t('widget.native.amounts', { saved: money(goal.savedAmount), target: money(goal.targetAmount) })
      : '',
  });
}

/**
 * Keeps the home-screen widgets in sync: fetches the widget summary while signed in (again when
 * the app comes to the foreground or entries/goal change) and clears the widgets on sign-out.
 */
export function useHomeWidgetsSync() {
  const { isAuthenticated } = useAuth();
  const { data, refetch } = useQuery({
    queryKey: WIDGET_SUMMARY_KEY,
    queryFn: () => getMyWidgetSummary(deviceTimeZone()),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isAuthenticated) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refetch();
    });
    return () => subscription.remove();
  }, [isAuthenticated, refetch]);

  useEffect(() => {
    try {
      if (!isAuthenticated) pushSignedOut();
      else if (data) pushSummary(data);
    } catch (error) {
      // A widget failure must never break the app (e.g. extension missing from an older build).
      console.warn('Home widgets update failed', error);
    }
  }, [isAuthenticated, data]);
}
