import { useCallback, useEffect, useState } from 'react';
import { subscribePush, unsubscribePush } from '@/api/push';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export function usePushNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window;

  useEffect(() => {
    if (!isSupported) {
      setPermission('unsupported');
      return;
    }
    setPermission(Notification.permission as NotificationPermission);

    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        setSubscribed(!!sub);
      });
    });
  }, [isSupported]);

  const subscribe = useCallback(async () => {
    setError(null);

    if (!isSupported) {
      setError('Notificações não suportadas neste navegador.');
      return;
    }

    if (!VAPID_PUBLIC_KEY) {
      setError('Configuração de notificações indisponível.');
      return;
    }

    setLoading(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm as NotificationPermission);

      if (perm === 'denied') {
        setError('Permissão de notificações negada. Habilite nas configurações do navegador.');
        return;
      }

      if (perm !== 'granted') {
        setError('Permissão de notificações não concedida.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
      });
      await subscribePush(sub.toJSON());
      setSubscribed(true);
    } catch (err) {
      console.error('[usePushNotification] subscribe error:', err);
      setError('Erro ao ativar notificações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  const unsubscribe = useCallback(async () => {
    setError(null);

    if (!isSupported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribePush(sub.endpoint);
        await sub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error('[usePushNotification] unsubscribe error:', err);
      setError('Erro ao desativar notificações. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [isSupported]);

  return { permission, subscribed, loading, error, isSupported, subscribe, unsubscribe };
}
