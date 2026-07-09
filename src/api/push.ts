import apiClient from './client';

export async function subscribePush(subscription: PushSubscriptionJSON): Promise<void> {
  await apiClient.post('/push/subscribe', {
    endpoint: subscription.endpoint,
    p256dh: subscription.keys?.p256dh,
    auth: subscription.keys?.auth,
  });
}

export async function unsubscribePush(endpoint: string): Promise<void> {
  await apiClient.delete('/push/subscribe', { data: { endpoint } });
}
