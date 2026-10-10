import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Empty, ErrorState, Icon, Loading, Money, Screen, Txt, useAccent } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EntryFormSheet } from '@/components/EntryFormSheet';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useProfile } from '@/hooks/useUser';
import { groupEntriesByDate } from '@/utils/groupEntriesByDate';
import { EntryKindColors, EntryKindIcons, isCredit, useEntryKindLabels } from '@/utils/entryKind';
import { formatCurrency } from '@/utils/currency';
import { EntryKind, type Entry } from '@/types';
import { useTheme } from '@/theme/ThemeContext';

export default function EntriesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const accent = useAccent();
  const params = useLocalSearchParams<{ month?: string; year?: string; date?: string }>();
  const now = new Date();
  const [month, setMonth] = useState(Number(params.month) || now.getMonth() + 1);
  const [year, setYear] = useState(Number(params.year) || now.getFullYear());
  const [editing, setEditing] = useState<Entry | null>(null);
  const [focusDate, setFocusDate] = useState<string | undefined>(params.date);

  const scrollRef = useRef<ScrollView>(null);
  const groupY = useRef(new Map<string, number>());
  // Only scroll once per tapped day, so a refetch after editing doesn't yank the list back.
  const scrolledFor = useRef<string | undefined>(undefined);

  // The tab stays mounted, so a tap on a day in Saldos arrives as new params, not a fresh screen.
  useEffect(() => {
    if (params.month) setMonth(Number(params.month));
    if (params.year) setYear(Number(params.year));
    setFocusDate(params.date);
    scrolledFor.current = undefined;
  }, [params.month, params.year, params.date]);

  const { data: profile } = useProfile();
  const { data: tags } = useTags();
  const kindLabels = useEntryKindLabels();
  const { data, isLoading, isError, refetch, isRefetching } = useEntries(month, year, 1, 200);

  const groups = useMemo(() => groupEntriesByDate(data?.items ?? []), [data]);
  const tagName = (id: string | null) => tags?.find((tag) => tag.id === id)?.name;
  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);

  // Scroll to the focused day once its group has been laid out; days without entries land on the closest earlier one.
  const scrollToFocus = () => {
    if (!focusDate || !groups.length || scrolledFor.current === focusDate) return;
    const target = groups.find((g) => g.key <= focusDate) ?? groups[groups.length - 1];
    const y = groupY.current.get(target.key);
    if (y === undefined) return;
    scrollRef.current?.scrollTo({ y: Math.max(0, y - 8), animated: true });
    scrolledFor.current = focusDate;
  };
  useEffect(scrollToFocus, [focusDate, groups]);

  const amountColor = (kind: EntryKind) => (isCredit(kind) ? colors.income : kind === EntryKind.Economia ? colors.teal : colors.expense);

  return (
    <View style={{ flex: 1 }}>
      <Screen
        title={t('appLayout.entries')}
        headerRight={<MonthSwitcher compact month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y), setFocusDate(undefined))} />}
        refreshing={isRefetching}
        onRefresh={refetch}
        scrollRef={scrollRef}
      >
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <ErrorState message={t('entries.loadError')} onRetry={refetch} />
        ) : groups.length === 0 ? (
          <Empty icon="receipt-outline" sf="list.bullet.rectangle" title={t('entries.emptyTitle')} subtitle={t('entries.emptySubtitle')} />
        ) : (
          groups.map((group) => {
            const focused = group.key === focusDate;
            return (
              <View
                key={group.key}
                onLayout={(e) => {
                  groupY.current.set(group.key, e.nativeEvent.layout.y);
                  if (focusDate && group.key <= focusDate) scrollToFocus();
                }}
                style={{ marginTop: 18 }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7, paddingHorizontal: 16 }}>
                  <Txt variant="label" color={focused ? accent : undefined} muted={!focused}>
                    {group.label}
                  </Txt>
                  <Txt variant="caption" color={group.total >= 0 ? colors.income : colors.expense} style={{ fontWeight: '700' }}>
                    {group.total >= 0 ? '+' : '−'}
                    {money(Math.abs(group.total))}
                  </Txt>
                </View>
                <View
                  style={{
                    backgroundColor: colors.paper,
                    borderRadius: 22,
                    borderCurve: 'continuous',
                    overflow: 'hidden',
                    borderWidth: 2,
                    borderColor: focused ? accent : 'transparent',
                  }}
                >
                  {group.entries.map((entry, i) => {
                    const credit = isCredit(entry.kind);
                    const tag = tagName(entry.tagId);
                    const amount = `${credit ? '+' : '−'}${money(entry.value)}`;
                    return (
                      <Pressable
                        key={entry.id}
                        accessibilityRole="button"
                        accessibilityLabel={[entry.title, kindLabels[entry.kind], tag, amount].filter(Boolean).join(', ')}
                        onPress={() => setEditing(entry)}
                        style={({ pressed }) => ({
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 12,
                          paddingVertical: 11,
                          paddingHorizontal: 14,
                          backgroundColor: pressed ? colors.hover : 'transparent',
                        })}
                      >
                        {/* Wallet-style transaction icon: the kind as an SF Symbol in a tinted circle. */}
                        <View style={{ width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: EntryKindColors[entry.kind] + '29' }}>
                          <Icon sf={EntryKindIcons[entry.kind].sf} ion={EntryKindIcons[entry.kind].ion} size={17} color={EntryKindColors[entry.kind]} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Txt numberOfLines={1} style={{ fontWeight: '500' }}>
                            {entry.title}
                            {entry.isRecurring ? '  ↻' : ''}
                          </Txt>
                          <Txt variant="caption" muted numberOfLines={1}>
                            {kindLabels[entry.kind]}
                            {tag ? ` · ${tag}` : ''}
                          </Txt>
                        </View>
                        <Money style={{ fontSize: 17, color: amountColor(entry.kind) }}>{amount}</Money>
                        {i < group.entries.length - 1 && (
                          <View style={{ position: 'absolute', left: 64, right: 0, bottom: 0, height: StyleSheet.hairlineWidth, backgroundColor: colors.divider }} />
                        )}
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}
      </Screen>
      <EntryFormSheet visible={!!editing} entry={editing} defaultDate={focusDate} onClose={() => setEditing(null)} />
    </View>
  );
}
