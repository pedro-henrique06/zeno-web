import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Empty, Loading, Screen, Txt } from '@/ui';
import { MonthSwitcher } from '@/components/MonthSwitcher';
import { EntryFormSheet } from '@/components/EntryFormSheet';
import { useEntries } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useProfile } from '@/hooks/useUser';
import { groupEntriesByDate } from '@/utils/groupEntriesByDate';
import { EntryKindColors, isCredit, useEntryKindLabels } from '@/utils/entryKind';
import { formatCurrency } from '@/utils/currency';
import type { Entry } from '@/types';
import { brand, useTheme } from '@/theme/ThemeContext';

export default function EntriesScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ month?: string; year?: string; date?: string }>();
  const now = new Date();
  const [month, setMonth] = useState(Number(params.month) || now.getMonth() + 1);
  const [year, setYear] = useState(Number(params.year) || now.getFullYear());
  const [editing, setEditing] = useState<Entry | null>(null);
  const [creating, setCreating] = useState(false);

  const { data: profile } = useProfile();
  const { data: tags } = useTags();
  const kindLabels = useEntryKindLabels();
  const { data, isLoading, isError, refetch, isRefetching } = useEntries(month, year, 1, 200);

  const groups = useMemo(() => groupEntriesByDate(data?.items ?? []), [data]);
  const tagName = (id: string | null) => tags?.find((tag) => tag.id === id)?.name;
  const money = (v: number) => formatCurrency(v, profile?.currency, profile?.language);

  return (
    <View style={{ flex: 1 }}>
      <Screen refreshing={isRefetching} onRefresh={refetch}>
        <MonthSwitcher month={month} year={year} onChange={(m, y) => (setMonth(m), setYear(y))} />
        {isLoading ? (
          <Loading />
        ) : isError ? (
          <Txt color={brand.expense} style={{ textAlign: 'center', marginTop: 32 }}>
            {t('entries.loadError')}
          </Txt>
        ) : groups.length === 0 ? (
          <Empty icon="receipt-outline" title={t('entries.emptyTitle')} subtitle={t('entries.emptySubtitle')} />
        ) : (
          groups.map((group) => (
            <View key={group.key} style={{ marginBottom: 18 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6, paddingHorizontal: 4 }}>
                <Txt variant="label" muted>
                  {group.label}
                </Txt>
                <Txt variant="caption" color={group.total >= 0 ? brand.income : brand.expense} style={{ fontWeight: '700' }}>
                  {group.total >= 0 ? '+' : '−'}
                  {money(Math.abs(group.total))}
                </Txt>
              </View>
              <View style={{ backgroundColor: colors.paper, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: colors.divider }}>
                {group.entries.map((entry, i) => {
                  const credit = isCredit(entry.kind);
                  return (
                    <Pressable
                      key={entry.id}
                      accessibilityRole="button"
                      onPress={() => setEditing(entry)}
                      style={({ pressed }) => ({
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        padding: 14,
                        borderTopWidth: i ? 0.5 : 0,
                        borderTopColor: colors.divider,
                        backgroundColor: pressed ? colors.hover : 'transparent',
                      })}
                    >
                      <View style={{ width: 8, height: 36, borderRadius: 4, backgroundColor: EntryKindColors[entry.kind] }} />
                      <View style={{ flex: 1 }}>
                        <Txt numberOfLines={1} style={{ fontWeight: '600' }}>
                          {entry.title}
                          {entry.isRecurring ? '  ↻' : ''}
                        </Txt>
                        <Txt variant="caption" muted numberOfLines={1}>
                          {kindLabels[entry.kind]}
                          {tagName(entry.tagId) ? ` · ${tagName(entry.tagId)}` : ''}
                        </Txt>
                      </View>
                      <Txt color={credit ? brand.income : brand.expense} style={{ fontWeight: '700', fontVariant: ['tabular-nums'] }}>
                        {credit ? '+' : '−'}
                        {money(entry.value)}
                      </Txt>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))
        )}
      </Screen>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('entries.new')}
        onPress={() => setCreating(true)}
        style={{
          position: 'absolute',
          right: 20,
          bottom: 20,
          width: 58,
          height: 58,
          borderRadius: 29,
          backgroundColor: brand.blue,
          alignItems: 'center',
          justifyContent: 'center',
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.25,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        }}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </Pressable>
      <EntryFormSheet visible={creating || !!editing} entry={editing} defaultDate={params.date} onClose={() => (setCreating(false), setEditing(null))} />
    </View>
  );
}
