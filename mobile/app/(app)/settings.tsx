import { useState } from 'react';
import { Switch, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Button, Row, Screen, Section, Segmented, Txt } from '@/ui';
import {
  useDisableNotifications,
  useEnableNotifications,
  useNotificationPreference,
  useSendTestNotification,
  useUpdateNotificationPreference,
} from '@/hooks/useNotifications';
import type { PushSetupResult } from '@/lib/pushToken';
import { brand, useTheme } from '@/theme/ThemeContext';

const HOURS = [7, 8, 9, 12, 18, 20];
const DEFAULT_ZONE = 'America/Sao_Paulo';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const { mode, toggleTheme } = useTheme();
  const { data: preference } = useNotificationPreference();
  const enable = useEnableNotifications();
  const disable = useDisableNotifications();
  const updatePreference = useUpdateNotificationPreference();
  const sendTest = useSendTestNotification();
  const [notice, setNotice] = useState<string | null>(null);

  const zone = preference?.timeZoneId || DEFAULT_ZONE;
  const hour = preference?.sendHour ?? 9;
  const enabled = preference?.dailyEnabled ?? false;
  const busy = enable.isPending || disable.isPending;

  const explain = (result: Extract<PushSetupResult, { ok: false }>) => {
    if (result.reason === 'simulator') return t('push.simulator');
    if (result.reason === 'denied') return t('push.denied');
    if (result.reason === 'no-project') return t('push.noProject');
    return result.detail ? `${t('push.error')} (${result.detail})` : t('push.error');
  };

  const toggle = (value: boolean) => {
    setNotice(null);
    if (value) {
      enable.mutate(
        { dailyEnabled: true, sendHour: hour, timeZoneId: zone },
        {
          onSuccess: (result) => !result.ok && setNotice(explain(result)),
          onError: () => setNotice(t('push.error')),
        },
      );
    } else {
      disable.mutate({ dailyEnabled: false, sendHour: hour, timeZoneId: zone }, { onError: () => setNotice(t('push.error')) });
    }
  };

  return (
    <Screen>
      <Section title={t('settings.sectionAppearance')}>
        <Row
          last
          icon={mode === 'dark' ? 'moon-outline' : 'sunny-outline'}
          title={mode === 'dark' ? t('settings.lightMode') : t('settings.darkMode')}
          right={<Switch value={mode === 'dark'} onValueChange={toggleTheme} trackColor={{ true: brand.blue }} />}
        />
      </Section>

      <Section title={t('push.title')}>
        <Row
          icon="notifications-outline"
          title={t('push.daily')}
          subtitle={enabled ? t('push.dailyOn', { hour }) : t('push.dailyOff')}
          right={<Switch value={enabled} disabled={busy} onValueChange={toggle} trackColor={{ true: brand.blue }} />}
          last={!enabled}
        />
        {enabled && (
          <View style={{ padding: 14, gap: 10 }}>
            <Txt variant="label" muted>
              {t('push.hour')}
            </Txt>
            <Segmented
              value={hour}
              onChange={(h) => updatePreference.mutate({ dailyEnabled: true, sendHour: h, timeZoneId: zone })}
              options={HOURS.map((h) => ({ value: h, label: t('push.hourLabel', { hour: h }) }))}
            />
            {preference && (
              <Txt variant="caption" muted>
                {t('push.devices', { count: preference.activeDevices })}
              </Txt>
            )}
            <Button
              variant="secondary"
              icon="paper-plane-outline"
              title={sendTest.isPending ? t('push.testing') : t('push.test')}
              loading={sendTest.isPending}
              onPress={() => {
                setNotice(null);
                sendTest.mutate(undefined, {
                  onSuccess: (r) => setNotice(r.pushConfigured ? r.message : t('push.notConfigured')),
                  onError: () => setNotice(t('push.error')),
                });
              }}
            />
          </View>
        )}
      </Section>
      {notice && (
        <Txt variant="small" muted style={{ marginTop: 12, marginHorizontal: 4 }}>
          {notice}
        </Txt>
      )}
    </Screen>
  );
}
