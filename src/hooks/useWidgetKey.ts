import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as widgetApi from '@/api/widget';

export function useWidgetKeyStatus(enabled = true) {
  return useQuery({ queryKey: ['widget-key'], queryFn: widgetApi.getWidgetKeyStatus, enabled });
}

export function useCreateWidgetKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: widgetApi.createWidgetKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-key'] }),
  });
}

export function useRevokeWidgetKey() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: widgetApi.revokeWidgetKey,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['widget-key'] }),
  });
}
