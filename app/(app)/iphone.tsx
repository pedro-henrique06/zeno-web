import { useMemo, useState } from 'react';
import { Alert, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Field, Loading, Row, Screen, Section, Txt } from '@/ui';
import { CopyField } from '@/components/CopyField';
import { API_URL } from '@/api/client';
import { useCreateWidgetKey, useRevokeWidgetKey, useWidgetKeyStatus } from '@/hooks/useWidgetKey';
import {
  useAddCaptureRule,
  useCaptureKeyStatus,
  useCaptureRules,
  useCreateCaptureKey,
  useDeleteCaptureRule,
  useRevokeCaptureKey,
} from '@/hooks/useCaptureKey';
import { useTags } from '@/hooks/useTags';
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
        <Txt variant="small" color={brand.expense} style={{ marginTop: 8 }}>
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
        <Txt variant="small" color={brand.expense} style={{ marginBottom: 8 }}>
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
          right={<Txt variant="caption" color={brand.expense}>{t('capture.ruleDelete')}</Txt>}
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

function CaptureBlock() {
  const { t } = useTranslation();
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
        <Txt variant="small" color={brand.expense} style={{ marginTop: 8 }}>
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
      <Section title={t('capture.rulesTitle')}>
        <View style={{ padding: 14 }}>
          <RulesBlock />
        </View>
      </Section>
    </Screen>
  );
}
