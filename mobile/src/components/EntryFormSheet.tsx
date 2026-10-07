import { useEffect, useState } from 'react';
import { Alert, Pressable, Switch, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { Button, Field, Sheet, Txt } from '@/ui';
import { useCreateEntry, useDeleteEntry, useUpdateEntry } from '@/hooks/useEntries';
import { useTags } from '@/hooks/useTags';
import { useHouses } from '@/hooks/useHouses';
import { useProfile } from '@/hooks/useUser';
import { EntryKind, type Entry } from '@/types';
import { EntryKindColors, useEntryKindLabels } from '@/utils/entryKind';
import { CURRENCY_SYMBOLS, LANGUAGE_LOCALES } from '@/utils/currency';
import { brand, useTheme } from '@/theme/ThemeContext';

const MAX_VALUE_CENTS = 99_999_999_99;
const KINDS = [EntryKind.Entrada, EntryKind.Saida, EntryKind.Diario, EntryKind.Economia, EntryKind.Cartao];

function Chips<T extends string>({ items, value, onChange }: { items: { id: T; label: string }[]; value: T; onChange: (id: T) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {items.map((item) => {
        const active = item.id === value;
        return (
          <Pressable
            key={item.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(item.id)}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: active ? brand.blue : colors.divider,
              backgroundColor: active ? brand.blue + '22' : colors.paper,
            }}
          >
            <Txt variant="small" color={active ? brand.blue : undefined}>
              {item.label}
            </Txt>
          </Pressable>
        );
      })}
    </View>
  );
}

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
  const { colors } = useTheme();
  const kindLabels = useEntryKindLabels();
  const { data: profile } = useProfile();
  const { data: tags } = useTags();
  const { data: houses } = useHouses();
  const create = useCreateEntry();
  const update = useUpdateEntry();
  const remove = useDeleteEntry();
  const isEditing = !!entry;

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

  // Reset the form every time the sheet opens, from the entry being edited or the defaults.
  useEffect(() => {
    if (!visible) return;
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
  }, [visible, entry, defaultDate, defaultKind]);

  const symbol = CURRENCY_SYMBOLS[profile?.currency ?? 'BRL'];
  const display = (cents / 100).toLocaleString(LANGUAGE_LOCALES[profile?.language ?? 'PtBR'], {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  const onValueChange = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setCents(Math.min(Number(digits || '0'), MAX_VALUE_CENTS));
  };

  const busy = create.isPending || update.isPending || remove.isPending;
  const canSave = title.trim().length > 0 && cents > 0;

  const save = () => {
    const payload = {
      title: title.trim(),
      value: cents / 100,
      kind,
      description,
      tagId: tagId || null,
      date,
      isRecurring,
      recurrenceEndDate: isRecurring && hasEnd ? endDate : null,
      houseId: houseId || null,
    };
    if (entry) update.mutate({ id: entry.id, ...payload }, { onSuccess: onClose });
    else create.mutate(payload, { onSuccess: onClose });
  };

  const confirmDelete = () => {
    if (!entry) return;
    Alert.alert(
      t('entryForm.deleteConfirmTitle'),
      entry.isRecurring ? t('entryForm.deleteRecurringMessage') : t('entryForm.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('entryForm.delete'), style: 'destructive', onPress: () => remove.mutate(entry.id, { onSuccess: onClose }) },
      ],
    );
  };

  const asDate = (s: string) => dayjs(s).toDate();

  return (
    <Sheet visible={visible} onClose={onClose} title={isEditing ? t('entryForm.editTitle') : t('entryForm.newTitle')}>
      <Txt variant="label" muted style={{ marginBottom: 6 }}>
        {t('entryForm.type')}
      </Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
        {KINDS.map((k) => {
          const active = k === kind;
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              onPress={() => setKind(k)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 9,
                borderRadius: 20,
                backgroundColor: active ? EntryKindColors[k] : colors.paper,
                borderWidth: 1,
                borderColor: active ? EntryKindColors[k] : colors.divider,
              }}
            >
              <Txt variant="small" color={active ? '#fff' : undefined}>
                {kindLabels[k]}
              </Txt>
            </Pressable>
          );
        })}
      </View>

      <Field label={t('entryForm.titleField')} value={title} onChangeText={setTitle} />
      <Field
        label={`${t('entryForm.value')} (${symbol})`}
        value={display}
        onChangeText={onValueChange}
        keyboardType="number-pad"
        selectTextOnFocus
      />

      <Txt variant="label" muted style={{ marginBottom: 6 }}>
        {t('entryForm.date')}
      </Txt>
      <View style={{ alignItems: 'flex-start', marginBottom: 14 }}>
        <DateTimePicker
          value={asDate(date)}
          mode="date"
          onChange={(_, selected) => selected && setDate(dayjs(selected).format('YYYY-MM-DD'))}
        />
      </View>

      <Txt variant="label" muted style={{ marginBottom: 6 }}>
        {t('entryForm.tag')}
      </Txt>
      <View style={{ marginBottom: 14 }}>
        <Chips
          value={tagId}
          onChange={setTagId}
          items={[{ id: '', label: t('common.noTag') }, ...(tags ?? []).map((tag) => ({ id: tag.id, label: tag.name }))]}
        />
      </View>

      {houses && houses.length > 0 && (
        <>
          <Txt variant="label" muted style={{ marginBottom: 6 }}>
            {t('entryForm.house')}
          </Txt>
          <View style={{ marginBottom: 14 }}>
            <Chips
              value={houseId}
              onChange={setHouseId}
              items={[{ id: '', label: t('entryForm.noHouse') }, ...houses.map((h) => ({ id: h.id, label: h.name }))]}
            />
          </View>
        </>
      )}

      <Field label={t('entryForm.description')} value={description} onChangeText={setDescription} multiline style={{ minHeight: 70, textAlignVertical: 'top', paddingTop: 12 }} />

      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Txt>{t('entryForm.recurring')}</Txt>
        <Switch value={isRecurring} onValueChange={setIsRecurring} trackColor={{ true: brand.blue }} />
      </View>
      {isRecurring && (
        <>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Txt>{t('entryForm.hasRecurrenceEndDate')}</Txt>
            <Switch value={hasEnd} onValueChange={setHasEnd} trackColor={{ true: brand.blue }} />
          </View>
          {hasEnd && (
            <View style={{ alignItems: 'flex-start', marginBottom: 10 }}>
              <DateTimePicker
                value={asDate(endDate)}
                mode="date"
                minimumDate={asDate(date)}
                onChange={(_, selected) => selected && setEndDate(dayjs(selected).format('YYYY-MM-DD'))}
              />
            </View>
          )}
        </>
      )}

      <Button
        style={{ marginTop: 12 }}
        title={isEditing ? t('entryForm.save') : t('entryForm.create')}
        onPress={save}
        loading={create.isPending || update.isPending}
        disabled={!canSave || busy}
      />
      {isEditing && (
        <Button style={{ marginTop: 10 }} variant="ghost" title={t('entryForm.delete')} onPress={confirmDelete} disabled={busy} />
      )}
    </Sheet>
  );
}
