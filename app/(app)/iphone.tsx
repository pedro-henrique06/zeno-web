import { useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Field, Icon, Loading, Row, Screen, Section, Txt } from '@/ui';
import { CopyField } from '@/components/CopyField';
import { API_URL } from '@/api/client';
import { useCreateWidgetKey, useRevokeWidgetKey, useWidgetKeyStatus } from '@/hooks/useWidgetKey';
import {
  useAddCaptureRule,
  useCaptureCards,
  useCaptureKeyStatus,
  useClassifyCaptureCard,
  useCaptureRules,
  useCreateCaptureKey,
  useDeleteCaptureRule,
  useRevokeCaptureKey,
} from '@/hooks/useCaptureKey';
import { useTags } from '@/hooks/useTags';
import type { CaptureCard } from '@/api/capture';
import { buildWidgetScript } from '@/utils/widgetScript';
import { brand, useTheme } from '@/theme/ThemeContext';

function Step({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginTop: 14 }}>
      <Txt style={{ fontWeight: '700', marginBottom: 4 }}>{title}</Txt>
      {children}
    </View>
  );
}

function Body({ children }: { children: string }) {
  return (
    <Txt variant="small" muted style={{ marginBottom: 8 }}>
      {children}
    </Txt>
  );
}

function WidgetBlock() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: status } = useWidgetKeyStatus();
  const create = useCreateWidgetKey();
  const revoke = useRevokeWidgetKey();
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const enabled = !!status?.enabled;
  const script = useMemo(() => (key ? buildWidgetScript(API_URL, key) : ''), [key]);

  return (
    <View style={{ padding: 14 }}>
      <Txt variant="small" muted>
        {t('widget.intro')}
      </Txt>
      {error && (
        <Txt variant="small" color={colors.expense} style={{ marginTop: 8 }}>
          {t('widget.error')}
        </Txt>
      )}
      <Step title={t('widget.step2Title')}>
        <Body>{enabled && !key ? t('widget.step2Existing') : t('widget.step2')}</Body>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            style={{ flex: 1 }}
            title={enabled ? t('widget.regenerate') : t('widget.generate')}
            loading={create.isPending}
            onPress={() => {
              setError(false);
              create.mutate(undefined, { onSuccess: (c) => setKey(c.key), onError: () => setError(true) });
            }}
          />
          {enabled && (
            <Button
              variant="secondary"
              title={t('widget.revoke')}
              disabled={revoke.isPending}
              onPress={() => revoke.mutate(undefined, { onSuccess: () => setKey(null), onError: () => setError(true) })}
            />
          )}
        </View>
      </Step>
      {key && (
        <>
          <Step title={t('widget.step1Title')}>
            <Body>{t('widget.step1')}</Body>
          </Step>
          <Step title={t('widget.step3Title')}>
            <Body>{t('widget.step3')}</Body>
            <CopyField label={t('widget.scriptLabel')} value={script} multiline />
          </Step>
          <Step title={t('widget.step4Title')}>
            <Body>{t('widget.step4')}</Body>
          </Step>
          <Txt variant="caption" muted>
            {t('widget.secret')}
          </Txt>
        </>
      )}
    </View>
  );
}

function RulesBlock() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: rules = [] } = useCaptureRules();
  const { data: tags = [] } = useTags();
  const add = useAddCaptureRule();
  const remove = useDeleteCaptureRule();
  const [match, setMatch] = useState('');
  const [tagId, setTagId] = useState('');
  const [error, setError] = useState(false);
  const tagName = (id: string) => tags.find((tag) => tag.id === id)?.name ?? '—';

  return (
    <View>
      <Txt variant="small" muted style={{ marginBottom: 8 }}>
        {t('capture.rulesIntro')}
      </Txt>
      {error && (
        <Txt variant="small" color={colors.expense} style={{ marginBottom: 8 }}>
          {t('capture.error')}
        </Txt>
      )}
      {rules.map((rule) => (
        <Row
          key={rule.id}
          title={`“${rule.match}” → ${tagName(rule.tagId)}`}
          onPress={() =>
            Alert.alert(t('capture.ruleDelete'), rule.match, [
              { text: t('common.cancel'), style: 'cancel' },
              { text: t('capture.ruleDelete'), style: 'destructive', onPress: () => remove.mutate(rule.id) },
            ])
          }
          right={<Txt variant="caption" color={colors.expense}>{t('capture.ruleDelete')}</Txt>}
        />
      ))}
      {tags.length === 0 ? (
        <Txt variant="small" muted>
          {t('capture.rulesNoTags')}
        </Txt>
      ) : (
        <View style={{ marginTop: 10 }}>
          <Field label={t('capture.ruleMatch')} placeholder={t('capture.ruleMatchPlaceholder')} value={match} onChangeText={setMatch} maxLength={60} />
          <Txt variant="label" muted style={{ marginBottom: 6 }}>
            {t('capture.ruleTag')}
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            {tags.map((tag) => {
              const active = tag.id === tagId;
              return (
                <Txt
                  key={tag.id}
                  accessibilityRole="button"
                  onPress={() => setTagId(tag.id)}
                  variant="small"
                  color={active ? brand.blue : undefined}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    overflow: 'hidden',
                    borderWidth: 1,
                    borderColor: active ? brand.blue : colors.divider,
                  }}
                >
                  {tag.name}
                </Txt>
              );
            })}
          </View>
          <Button
            variant="secondary"
            title={t('capture.ruleAdd')}
            loading={add.isPending}
            disabled={!match.trim() || !tagId}
            onPress={() => {
              setError(false);
              add.mutate(
                { match: match.trim(), tagId },
                { onSuccess: () => (setMatch(''), setTagId('')), onError: () => setError(true) },
              );
            }}
          />
        </View>
      )}
    </View>
  );
}

/**
 * The Wallet cards seen in captures. Credit cards' purchases become "Gasto com cartão" (they land on the
 * bill), debit ones "Diário". Classifying can also move the card's earlier purchases.
 */
function CardsBlock() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: cards = [] } = useCaptureCards();
  const classify = useClassifyCaptureCard();

  const choose = (card: CaptureCard, type: 'credit' | 'debit') => {
    if (card.type === type) return;
    const run = (applyToPast: boolean) =>
      classify.mutate(
        { id: card.id, type, applyToPast },
        {
          onSuccess: (r) => {
            if (r.updatedEntries > 0) Alert.alert(t('capture.cardsUpdated', { count: r.updatedEntries }));
          },
          onError: () => Alert.alert(t('capture.error')),
        },
      );
    if (card.purchaseCount === 0) return run(false);
    Alert.alert(
      t(type === 'credit' ? 'capture.cardsAskCredit' : 'capture.cardsAskDebit', { name: card.name }),
      t('capture.cardsAskPast', { count: card.purchaseCount }),
      [
        { text: t('capture.cardsOnlyNext'), onPress: () => run(false) },
        { text: t('capture.cardsApplyPast'), onPress: () => run(true) },
      ],
    );
  };

  if (cards.length === 0)
    return (
      <Txt variant="small" muted style={{ padding: 14 }}>
        {t('capture.cardsEmpty')}
      </Txt>
    );

  return (
    <View>
      {cards.map((card, i) => {
        const tint = card.type === 'credit' ? '#7A4FD6' : card.type === 'debit' ? '#C26A00' : '#636366';
        const status = card.type === 'credit' ? t('capture.cardsCredit') : card.type === 'debit' ? t('capture.cardsDebit') : t('capture.cardsUnclassified');
        return (
          <View key={card.id} style={[styles.cardRow, i > 0 && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.divider }]}>
            <View style={[styles.cardIcon, { backgroundColor: tint }]}>
              <Icon sf="creditcard.fill" ion="card" size={15} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Txt numberOfLines={1}>{card.name}</Txt>
              <Txt variant="caption" color={card.type ? colors.textSecondary : colors.expense}>
                {t('capture.cardsPurchases', { count: card.purchaseCount })} · {status}
              </Txt>
            </View>
            <View style={[styles.pills, { backgroundColor: colors.fill }]} accessibilityRole="radiogroup">
              {(['credit', 'debit'] as const).map((type) => {
                const active = card.type === type;
                return (
                  <Pressable
                    key={type}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={`${card.name}: ${type === 'credit' ? t('capture.cardsCredit') : t('capture.cardsDebit')}`}
                    onPress={() => choose(card, type)}
                    style={[styles.pill, active && { backgroundColor: colors.mode === 'dark' ? '#636366' : '#FFFFFF' }]}
                  >
                    <Txt variant="caption" style={{ fontWeight: active ? '600' : '400' }}>
                      {type === 'credit' ? t('capture.cardsCredit') : t('capture.cardsDebit')}
                    </Txt>
                  </Pressable>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}

function CaptureBlock() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { data: status } = useCaptureKeyStatus();
  const create = useCreateCaptureKey();
  const revoke = useRevokeCaptureKey();
  const [key, setKey] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const enabled = !!status?.enabled;

  return (
    <View style={{ padding: 14 }}>
      <Txt variant="small" muted>
        {t('capture.intro')}
      </Txt>
      {error && (
        <Txt variant="small" color={colors.expense} style={{ marginTop: 8 }}>
          {t('capture.error')}
        </Txt>
      )}
      <Step title={t('capture.step1Title')}>
        <Body>{enabled && !key ? t('capture.step1Existing') : t('capture.step1')}</Body>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button
            style={{ flex: 1 }}
            title={enabled ? t('capture.regenerate') : t('capture.generate')}
            loading={create.isPending}
            onPress={() => {
              setError(false);
              create.mutate(undefined, { onSuccess: (c) => setKey(c.key), onError: () => setError(true) });
            }}
          />
          {enabled && (
            <Button
              variant="secondary"
              title={t('capture.revoke')}
              disabled={revoke.isPending}
              onPress={() => revoke.mutate(undefined, { onSuccess: () => setKey(null), onError: () => setError(true) })}
            />
          )}
        </View>
      </Step>
      {key && (
        <>
          <Step title={t('capture.step2Title')}>
            <Body>{t('capture.step2')}</Body>
          </Step>
          <Step title={t('capture.step3Title')}>
            <Body>{t('capture.step3')}</Body>
            <CopyField label={t('capture.fieldUrl')} value={`${API_URL}/capture/entry`} />
            <CopyField label={t('capture.fieldHeaderName')} value="X-Capture-Key" />
            <CopyField label={t('capture.fieldHeaderValue')} value={key} />
            <CopyField label={t('capture.fieldBodyTitle')} value="title" />
            <CopyField label={t('capture.fieldBodyAmount')} value="amount" />
            <Body>{t('capture.step3Vars')}</Body>
            <CopyField label={t('capture.fieldBodyCard')} value="card" />
            <CopyField label={t('capture.fieldBodyCategory')} value="category" />
            <Body>{t('capture.step3Extra')}</Body>
          </Step>
          <Txt variant="caption" muted>
            {t('capture.secret')}
          </Txt>
        </>
      )}
      <Step title={t('capture.limitsTitle')}>
        <Body>{t('capture.limits')}</Body>
      </Step>
    </View>
  );
}

export default function IphoneScreen() {
  const { t } = useTranslation();
  const { data: tags, isLoading } = useTags();
  if (isLoading && !tags) return <Screen><Loading /></Screen>;
  return (
    <Screen>
      <Section title={t('widget.section')}>
        <WidgetBlock />
      </Section>
      <Section title={t('capture.title')}>
        <CaptureBlock />
      </Section>
      <Section title={t('capture.cardsTitle')} footer={t('capture.cardsFooter')}>
        <CardsBlock />
      </Section>
      <Section title={t('capture.rulesTitle')}>
        <View style={{ padding: 14 }}>
          <RulesBlock />
        </View>
      </Section>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 14 },
  cardIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  pills: { flexDirection: 'row', borderRadius: 100, padding: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 100 },
});
