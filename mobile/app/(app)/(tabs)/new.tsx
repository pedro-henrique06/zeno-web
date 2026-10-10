import { useCallback, useState } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Screen } from '@/ui';
import { EntryForm } from '@/components/EntryFormSheet';

/**
 * The "+" tab: the whole new-entry form as a page. Opening the tab puts the cursor in the amount;
 * saving clears the form and shows the entry in Extrato.
 */
export default function NewEntryScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [resetKey, setResetKey] = useState(0);
  const [focusSignal, setFocusSignal] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setFocusSignal((n) => n + 1);
    }, []),
  );

  return (
    <Screen title={t('entryForm.newTitle')}>
      <EntryForm
        resetKey={resetKey}
        focusSignal={focusSignal}
        onDone={() => {
          setResetKey((n) => n + 1);
          router.navigate('/entries');
        }}
      />
    </Screen>
  );
}
