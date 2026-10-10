import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/notification';
import { devicePlatform, forgetPushToken, getStoredPushToken, requestPushToken, type PushSetupResult } from '@/lib/pushToken';

export function useNotificationPreference() {
  return useQuery({ queryKey: ['notification-preference'], queryFn: api.getPreference });
}

export function useUpdateNotificationPreference() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: api.UpdateNotificationPreferenceRequest) => api.updatePreference(data),
    onSuccess: (data) => queryClient.setQueryData(['notification-preference'], data),
  });
}

/** Asks for permission, registers this device on the server and turns the daily digest on. */
export function useEnableNotifications() {
  const queryClient = useQueryClient();
  return useMutation<PushSetupResult, Error, api.UpdateNotificationPreferenceRequest>({
    mutationFn: async (preference) => {
      const result = await requestPushToken();
      if (!result.ok) return result;
      await api.registerDevice(result.token, devicePlatform());
      await api.updatePreference({ ...preference, dailyEnabled: true });
      return result;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preference'] }),
  });
}

export function useDisableNotifications() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, api.UpdateNotificationPreferenceRequest>({
    mutationFn: async (preference) => {
      await api.updatePreference({ ...preference, dailyEnabled: false });
      const token = await getStoredPushToken();
      if (token) {
        await api.unregisterDevice(token).catch(() => {});
        await forgetPushToken();
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notification-preference'] }),
  });
}

export function useSendTestNotification() {
  return useMutation({ mutationFn: api.sendTest });
}
