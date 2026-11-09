import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { storage } from './storage';

/**
 * Asks for an App Store / Google Play rating after a signature moment (saving entries), never
 * from a button and never at launch, per Apple's guidelines. The system also caps the prompt
 * at three times a year, so this only decides when it is worth asking.
 */
const COUNT_KEY = 'zeno.review.entries';
const ASKED_AT_KEY = 'zeno.review.askedAt';
const ENTRIES_BEFORE_ASKING = 10;
const DAYS_BETWEEN_ASKS = 120;

export async function noteEntrySaved(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    const count = Number((await storage.get(COUNT_KEY)) ?? 0) + 1;
    await storage.set(COUNT_KEY, String(count));
    if (count < ENTRIES_BEFORE_ASKING) return;

    const askedAt = Number((await storage.get(ASKED_AT_KEY)) ?? 0);
    if (Date.now() - askedAt < DAYS_BETWEEN_ASKS * 24 * 60 * 60 * 1000) return;
    if (!(await StoreReview.isAvailableAsync())) return;

    await storage.set(ASKED_AT_KEY, String(Date.now()));
    await StoreReview.requestReview();
  } catch {
    // a rating prompt must never get in the way of saving an entry
  }
}
