import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { Button, Field, Section, Sheet, Txt, useAccent } from '@/ui';
import { useCreateEntry, useDeleteEntry, useUpdateEntry } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useHouses } from '@/hooks/useHouses';
import { useProfile } from '@/hooks/useUser';
import { EntryKind, type Entry } from '@/types';
import { EntryKindColors, useEntryKindLabels } from '@/utils/entryKind';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import { brand, fonts, useTheme, type Palette } from '@/theme/ThemeContext';

const MAX_VALUE_CENTS = 99_999_999_99;
const KINDS = [EntryKind.Diario, EntryKind.Saida, EntryKind.Entrada, EntryKind.Cartao, EntryKind.Economia];

/**
 * Calculator-style amount entry, whatever the cursor position: digits typed anywhere are appended on
 * the right, deletions remove from the right. "1", "8", "9", "0" reads 0,01 → 0,18 → 1,89 → 18,90.
 * `shown`/`typed` are the digits of the field before and after the edit.
 */
export function nextCents(cents: number, shown: string, typed: string): number {
  const diff = typed.length - shown.length;
  if (diff > 0) {
    let p = 0;
    while (p < shown.length && shown[p] === typed[p]) p++;
    return Number(`${cents}${typed.slice(p, p + diff)}`);
  }
  if (diff < 0) return Number(String(cents).slice(0, diff) || '0');
  return cents;
}

const amountColor = (kind: EntryKind, colors: Palette) =>
  kind === EntryKind.Entrada ? colors.income : kind === EntryKind.Economia ? colors.teal : colors.expense;

/** Horizontally scrolling pills; the selected one is filled. */
function Pills<T extends string | number>({
  items,
  value,
  onChange,
  colorOf,
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  colorOf?: (id: T) => string;
}) {
  const { colors } = useTheme();
  const accent = useAccent();
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }} style={{ marginHorizontal: -16 }}>
      {items.map((item) => {
        const active = item.id === value;
        const tint = colorOf?.(item.id) ?? accent;
        return (
          <Pressable
            key={String(item.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) Haptics.selectionAsync().catch(() => {});
              onChange(item.id);
            }}
            style={[styles.pill, { backgroundColor: active ? tint : colors.fill }]}
          >
            <Txt variant="small" color={active ? (colorOf ? brand.ink : '#fff') : colors.text} style={{ fontWeight: active ? '600' : '400' }}>
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** One line of an inset-grouped form: label on the left, control on the right. */
function FormRow({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.formRow}>
      <Txt>{label}</Txt>
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{children}</View>
      {!last && <View style={[styles.separator, { backgroundColor: colors.divider }]} />}
    </View>
  );
}

/**
 * The entry form itself, without a container: used inside the edit sheet and as the whole "+" tab.
 * `resetKey` changing re-seeds the fields from `entry` or the defaults.
 */
export function EntryForm({
  entry,
  defaultDate,
  defaultKind,
  resetKey,
  autoFocus,
  focusSignal,
  onDone,
}: {
  entry?: Entry | null;
  defaultDate?: string;
  defaultKind?: EntryKind;
  resetKey: unknown;
  autoFocus?: boolean;
  /** Each new value puts the cursor in the amount (the "+" tab sends one every time it is opened). */
  focusSignal?: unknown;
  onDone: (what: 'created' | 'updated' | 'deleted') => void;
}) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const kindLabels = useEntryKindLabels();
  const kindHints: Record<EntryKind, string> = {
    [EntryKind.Entrada]: t('addEntrySheet.descriptions.entrada'),
    [EntryKind.Saida]: t('addEntrySheet.descriptions.saida'),
    [EntryKind.Diario]: t('addEntrySheet.descriptions.diario'),
    [EntryKind.Economia]: t('addEntrySheet.descriptions.economia'),
    [EntryKind.Cartao]: t('addEntrySheet.descriptions.cartao'),
  };
  const { data: profile } = useProfile();
  const { data: tags } = useTags();
  const { data: houses } = useHouses();
  const create = useCreateEntry();
  const update = useUpdateEntry();
  const remove = useDeleteEntry();
  const isEditing = !!entry;
  const amountRef = useRef<TextInput>(null);
  useEffect(() => {
    if (focusSignal !== undefined) amountRef.current?.focus();
  }, [focusSignal]);

  const [title, setTitle] = useState('');
  const [cents, setCents] = useState(0);
  const [kind, setKind] = useState<EntryKind>(EntryKind.Diario);
  const [description, setDescription] = useState('');
  const [tagId, setTagId] = useState('');
  const [houseId, setHouseId] = useState('');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [isRecurring, setIsRecurring] = useState(false);
  const [hasEnd, setHasEnd] = useState(false);
  const [endDate, setEndDate] = useState(dayjs().add(1, 'year').format('YYYY-MM-DD'));

  useEffect(() => {
    setTitle(entry?.title ?? '');
    setCents(Math.round((entry?.value ?? 0) * 100));
    setKind(entry?.kind ?? defaultKind ?? EntryKind.Diario);
    setDescription(entry?.description ?? '');
    setTagId(entry?.tagId ?? '');
    setHouseId(entry?.houseId ?? '');
    setDate(entry?.date ? entry.date.substring(0, 10) : (defaultDate ?? dayjs().format('YYYY-MM-DD')));
    setIsRecurring(entry?.isRecurring ?? false);
    setHasEnd(!!entry?.recurrenceEndDate);
    setEndDate(entry?.recurrenceEndDate ? entry.recurrenceEndDate.substring(0, 10) : dayjs().add(1, 'year').format('YYYY-MM-DD'));
  }, [resetKey, entry, defaultDate, defaultKind]);

  const symbol = CURRENCY_SYMBOLS[profile?.currency ?? 'BRL'];
  const display = (cents / 100).toLocaleString(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  // Calculator-style entry, whatever the cursor position: new digits go on the right, deletes take
  // from the right. "1", "8", "9", "0" reads 0,01 → 0,18 → 1,89 → 18,90.
  const onValueChange = (text: string) => {
    setCents(Math.min(nextCents(cents, display.replace(/\D/g, ''), text.replace(/\D/g, '')), MAX_VALUE_CENTS));
  };

  const busy = create.isPending || update.isPending || remove.isPending;
  const canSave = cents > 0;
  // An empty title falls back to the tag, then the kind, so a quick "R$ 24,50 · Mercado" is enough to save.
  const fallbackTitle = tags?.find((tag) => tag.id === tagId)?.name ?? kindLabels[kind];

  const save = () => {
    const payload = {
      title: title.trim() || fallbackTitle,
      value: cents / 100,
      kind,
      description,
      tagId: tagId || null,
      date,
      isRecurring,
      recurrenceEndDate: isRecurring && hasEnd ? endDate : null,
      houseId: houseId || null,
    };
    const done = (what: 'created' | 'updated') => () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      onDone(what);
    };
    if (entry) update.mutate({ id: entry.id, ...payload }, { onSuccess: done('updated') });
    else create.mutate(payload, { onSuccess: done('created') });
  };

  const confirmDelete = () => {
    if (!entry) return;
    Alert.alert(
      t('entryForm.deleteConfirmTitle', { name: entry.title }),
      entry.isRecurring ? t('entryForm.deleteRecurringMessage') : t('entryForm.deleteConfirmMessage'),
      [
        { text: t('common.keep'), style: 'cancel' },
        { text: t('entryForm.deleteConfirmButton'), style: 'destructive', onPress: () => remove.mutate(entry.id, { onSuccess: () => onDone('deleted') }) },
      ],
    );
  };

  const asDate = (s: string) => dayjs(s).toDate();
  const picker = (value: string, onPick: (v: string) => void, min?: string) => (
    <DateTimePicker
      value={asDate(value)}
      mode="date"
      display={Platform.OS === 'ios' ? 'compact' : 'default'}
      minimumDate={min ? asDate(min) : undefined}
      accentColor={brand.blueAction}
      onChange={(_, selected) => selected && onPick(dayjs(selected).format('YYYY-MM-DD'))}
    />
  );

  return (
    <View>
      {/* Amount first and big, like Apple Cash: it's the one thing every entry needs. */}
      <View style={{ alignItems: 'center', paddingTop: 8, paddingBottom: 4 }}>
        <Txt variant="caption" muted>
          {`${t('entryForm.value')} (${symbol})`}
        </Txt>
        <TextInput
          ref={amountRef}
          accessibilityLabel={`${t('entryForm.value')} (${symbol})`}
          value={display}
          onChangeText={onValueChange}
          keyboardType="number-pad"
          // Digits fill in from the right (cents first), so the cursor is pinned to the end.
          selection={{ start: display.length, end: display.length }}
          autoFocus={autoFocus}
          caretHidden
          style={{
            fontFamily: fonts.display,
            fontSize: 56,
            letterSpacing: -2,
            textAlign: 'center',
            minWidth: 200,
            color: cents > 0 ? amountColor(kind, colors) : colors.textDisabled,
            fontVariant: ['tabular-nums'],
          }}
        />
      </View>

      <Pills
        items={KINDS.map((k) => ({ id: k, label: kindLabels[k] }))}
        value={kind}
        onChange={setKind}
        colorOf={(k) => EntryKindColors[k]}
      />
      {/* The kind names are the app's own vocabulary; one line says what each one means. */}
      <Txt variant="caption" muted style={{ marginTop: 10, textAlign: 'center' }}>
        {kindHints[kind]}
      </Txt>

      <Section>
        <FormRow label={t('entryForm.titleField')}>
          <TextInput
            accessibilityLabel={t('entryForm.titleField')}
            value={title}
            onChangeText={setTitle}
            placeholder={fallbackTitle}
            placeholderTextColor={colors.textDisabled}
            selectionColor={brand.blueAction}
            style={{ fontFamily: fonts.body, fontSize: 17, color: colors.text, textAlign: 'right', minWidth: 160, paddingVertical: 4 }}
          />
        </FormRow>
        <FormRow label={t('entryForm.date')}>{picker(date, setDate)}</FormRow>
        <FormRow label={t('entryForm.recurring')} last={!isRecurring}>
          <Switch value={isRecurring} onValueChange={setIsRecurring} />
        </FormRow>
        {isRecurring && (
          <FormRow label={t('entryForm.hasRecurrenceEndDate')} last={!hasEnd}>
            <Switch value={hasEnd} onValueChange={setHasEnd} />
          </FormRow>
        )}
        {isRecurring && hasEnd && (
          <FormRow label={t('entryForm.recurrenceEndDate')} last>
            {picker(endDate, setEndDate, date)}
          </FormRow>
        )}
      </Section>

      <Txt variant="label" muted style={{ marginTop: 24, marginBottom: 8, marginLeft: 16 }}>
        {t('entryForm.tag')}
      </Txt>
      <Pills items={[{ id: '', label: t('common.noTag') }, ...(tags ?? []).map((tag) => ({ id: tag.id, label: tag.name }))]} value={tagId} onChange={setTagId} />

      {houses && houses.length > 0 && (
        <>
          <Txt variant="label" muted style={{ marginTop: 20, marginBottom: 8, marginLeft: 16 }}>
            {t('entryForm.house')}
          </Txt>
          <Pills items={[{ id: '', label: t('entryForm.noHouse') }, ...houses.map((h) => ({ id: h.id, label: h.name }))]} value={houseId} onChange={setHouseId} />
        </>
      )}

      <View style={{ marginTop: 20 }}>
        <Field label={t('entryForm.description')} value={description} onChangeText={setDescription} multiline style={{ minHeight: 80, textAlignVertical: 'top', paddingTop: 14 }} />
      </View>

      <Button
        style={{ marginTop: 4 }}
        title={isEditing ? t('entryForm.save') : t('entryForm.create')}
        onPress={save}
        loading={create.isPending || update.isPending}
        disabled={!canSave || busy}
      />
      {!canSave && (
        <Txt variant="caption" muted style={{ marginTop: 8, textAlign: 'center' }}>
          {t('entryForm.valueRequired')}
        </Txt>
      )}
      {isEditing && (
        <Button style={{ marginTop: 10 }} variant="ghost" title={t('entryForm.delete')} onPress={confirmDelete} disabled={busy} />
      )}
    </View>
  );
}

/** Edit (or create) an entry in a page sheet. */
export function EntryFormSheet({
  visible,
  onClose,
  entry,
  defaultDate,
  defaultKind,
}: {
  visible: boolean;
  onClose: () => void;
  entry?: Entry | null;
  defaultDate?: string;
  defaultKind?: EntryKind;
}) {
  const { t } = useTranslation();
  return (
    <Sheet visible={visible} onClose={onClose} title={entry ? t('entryForm.editTitle') : t('entryForm.newTitle')}>
      <EntryForm entry={entry} defaultDate={defaultDate} defaultKind={defaultKind} resetKey={visible} autoFocus={!entry} onDone={onClose} />
    </Sheet>
  );
}

const styles = StyleSheet.create({
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 100 },
  formRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingHorizontal: 16, paddingVertical: 6, gap: 12 },
  separator: { position: 'absolute', left: 16, right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
});
