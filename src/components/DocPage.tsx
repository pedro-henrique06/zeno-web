import type { ReactNode } from 'react';
import { Linking, View } from 'react-native';
import { Txt, useAccent } from '@/ui';

/** Building blocks for the public text pages (/privacidade, /suporte). */

export const CONTACT_EMAIL = 'pedrohc.souza@icloud.com';

export function DocSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginTop: 24 }}>
      <Txt variant="title" accessibilityRole="header" style={{ marginBottom: 8 }}>
        {title}
      </Txt>
      {children}
    </View>
  );
}

export function P({ children }: { children: ReactNode }) {
  return <Txt style={{ lineHeight: 24, marginBottom: 10 }}>{children}</Txt>;
}

export function Item({ children }: { children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6, paddingRight: 8 }}>
      <Txt style={{ lineHeight: 24 }}>•</Txt>
      <Txt style={{ flex: 1, lineHeight: 24 }}>{children}</Txt>
    </View>
  );
}

export function Mail({ subject }: { subject?: string }) {
  const accent = useAccent();
  const href = `mailto:${CONTACT_EMAIL}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;
  return (
    <Txt color={accent} style={{ fontWeight: '600' }} accessibilityRole="link" onPress={() => Linking.openURL(href)}>
      {CONTACT_EMAIL}
    </Txt>
  );
}
