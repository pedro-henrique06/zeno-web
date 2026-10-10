import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { storage } from '@/lib/storage';

const KEY = 'zeno.pushToken';

export type PushSetupResult =
  | { ok: true; token: string }
  | { ok: false; reason: 'simulator' | 'denied' | 'no-project' | 'error'; detail?: string };

// Show the banner and play the sound even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function devicePlatform(): 0 | 1 {
  return Platform.OS === 'ios' ? 0 : 1;
}

export const getStoredPushToken = () => storage.get(KEY);

export const forgetPushToken = () => storage.remove(KEY);

/** Asks for permission and returns this device's Expo push token. */
export async function requestPushToken(): Promise<PushSetupResult> {
  if (!Device.isDevice) return { ok: false, reason: 'simulator' };

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Zeno',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const current = await Notifications.getPermissionsAsync();
  const status = current.granted ? current : await Notifications.requestPermissionsAsync();
  if (!status.granted) return { ok: false, reason: 'denied' };

  const projectId =
    (Constants.expoConfig?.extra?.eas?.projectId as string | undefined) ?? Constants.easConfig?.projectId;
  if (!projectId) return { ok: false, reason: 'no-project' };

  try {
    const { data } = await Notifications.getExpoPushTokenAsync({ projectId });
    await storage.set(KEY, data);
    return { ok: true, token: data };
  } catch (err) {
    return { ok: false, reason: 'error', detail: err instanceof Error ? err.message : String(err) };
  }
}
