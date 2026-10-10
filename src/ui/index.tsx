import { useState, type ReactNode, type RefObject } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import type { SFSymbol } from 'expo-symbols';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, fonts, useTheme } from '@/theme/ThemeContext';
import { Icon, type IonName } from './Icon';

export { Icon };

/** iOS text styles: largeTitle 34, title 20, body 17, subheadline 15, footnote 13. */
type TxtVariant = 'body' | 'small' | 'caption' | 'label' | 'title' | 'heading' | 'largeTitle' | 'display';

const VARIANTS: Record<TxtVariant, TextStyle> = {
  body: { fontFamily: fonts.body, fontSize: 17, letterSpacing: -0.4 },
  small: { fontFamily: fonts.body, fontSize: 15, letterSpacing: -0.2 },
  caption: { fontFamily: fonts.body, fontSize: 13, letterSpacing: -0.1 },
  label: { fontFamily: fonts.medium, fontWeight: '500', fontSize: 13, letterSpacing: 0.2, textTransform: 'uppercase' },
  title: { fontFamily: fonts.bold, fontWeight: '600', fontSize: 20, letterSpacing: -0.4 },
  heading: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 28, letterSpacing: -0.6 },
  largeTitle: { fontFamily: fonts.bold, fontWeight: '700', fontSize: 34, letterSpacing: -0.8 },
  display: { fontFamily: fonts.display, fontSize: 40, letterSpacing: -1.5 },
};

export function Txt({
  variant = 'body',
  muted,
  color,
  style,
  ...rest
}: TextProps & { variant?: TxtVariant; muted?: boolean; color?: string }) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[VARIANTS[variant], { color: color ?? (muted ? colors.textSecondary : colors.text) }, style]}
    />
  );
}

/** Money / numbers: the Fraunces brand face, tabular figures. The one place the app isn't SF Pro. */
export function Money({ style, ...rest }: TextProps & { color?: string }) {
  return <Txt {...rest} style={[{ fontFamily: fonts.display, fontVariant: ['tabular-nums'], letterSpacing: -0.5 }, style]} />;
}

/** The tint used for text and icons on page/paper (links, chevrons, selected chips). */
export function useAccent() {
  const { colors } = useTheme();
  return colors.mode === 'dark' ? brand.blue : brand.blueAction;
}

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  const { colors } = useTheme();
  return <View style={[styles.card, { backgroundColor: dark ? brand.navy : colors.paper }, style]}>{children}</View>;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  sf,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: IonName;
  sf?: SFSymbol;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const accent = useAccent();
  // iOS 26 buttons: filled capsule for the main action, gray "tinted" capsule with accent text for the rest.
  const bg =
    variant === 'primary' ? brand.blueAction : variant === 'danger' ? brand.expenseDark : variant === 'secondary' ? colors.fill : 'transparent';
  const fg = variant === 'primary' || variant === 'danger' ? '#fff' : accent;
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inactive }}
      disabled={inactive}
      onPress={() => {
        Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: inactive ? 0.4 : pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.98 : 1 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {(sf || icon) && (
            <View style={{ marginRight: 8 }}>
              {sf && icon ? <Icon sf={sf} ion={icon} size={17} color={fg} /> : icon ? <Ionicons name={icon} size={18} color={fg} /> : null}
            </View>
          )}
          <Text style={{ color: fg, fontFamily: fonts.bold, fontWeight: '600', fontSize: 17, letterSpacing: -0.4 }}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Field({
  label,
  error,
  trailing,
  style,
  ...rest
}: TextInputProps & { label?: string; error?: string | null; trailing?: ReactNode }) {
  const { colors } = useTheme();
  const accent = useAccent();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      {label && (
        <Txt variant="label" muted style={{ marginBottom: 6, marginLeft: 16 }}>
          {label}
        </Txt>
      )}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.textDisabled}
          selectionColor={accent}
          accessibilityLabel={label}
          {...rest}
          onFocus={(e) => {
            setFocused(true);
            rest.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            rest.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              color: colors.text,
              backgroundColor: colors.paper,
              // No resting border, like an inset-grouped iOS cell; the ring only says "focused" or "wrong".
              borderColor: error ? colors.expense : focused ? accent : 'transparent',
            },
            trailing ? { paddingRight: 48 } : null,
            style,
          ]}
        />
        {trailing ? <View style={{ position: 'absolute', right: 4 }}>{trailing}</View> : null}
      </View>
      {error ? (
        <Txt variant="caption" color={colors.expense} style={{ marginTop: 6, marginLeft: 16 }}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

/** iOS segmented control: gray track, raised thumb on the selected option. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.fill }]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => {
              if (!active) Haptics.selectionAsync().catch(() => {});
              onChange(o.value);
            }}
            style={[
              styles.segment,
              active && {
                backgroundColor: colors.mode === 'dark' ? '#636366' : '#FFFFFF',
                shadowColor: '#000',
                shadowOpacity: 0.12,
                shadowRadius: 4,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
              },
            ]}
          >
            <Text
              numberOfLines={1}
              style={{ fontFamily: fonts.medium, fontWeight: active ? '600' : '500', fontSize: 14, color: colors.text, letterSpacing: -0.2 }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * A grouped-list row in the style of iOS Settings: an SF Symbol in a coloured rounded square,
 * a separator that starts at the text (not the icon), a chevron when it navigates.
 */
export function Row({
  title,
  subtitle,
  icon,
  sf,
  tint,
  danger,
  right,
  onPress,
  last,
}: {
  title: string;
  subtitle?: string;
  icon?: IonName;
  sf?: SFSymbol;
  /** Background of the icon square. */
  tint?: string;
  danger?: boolean;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  const hasIcon = !!(icon || sf);
  const square = danger ? brand.expenseDark : (tint ?? brand.blueAction);
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [styles.listRow, pressed && { backgroundColor: colors.hover }]}
    >
      {hasIcon && (
        <View style={[styles.badge, { backgroundColor: square }]}>
          {sf && icon ? <Icon sf={sf} ion={icon} size={16} color="#fff" /> : icon ? <Ionicons name={icon} size={17} color="#fff" /> : null}
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Txt variant="body" color={danger ? colors.expense : undefined}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="caption" muted style={{ marginTop: 1 }}>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress && !danger ? <Icon sf="chevron.right" ion="chevron-forward" size={13} color={colors.textDisabled} /> : null)}
      {!last && <View style={[styles.separator, { backgroundColor: colors.divider, left: hasIcon ? 58 : 16 }]} />}
    </Pressable>
  );
}

/** Inset-grouped section: optional uppercase header above a rounded card of rows. */
export function Section({ title, footer, children }: { title?: string; footer?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 24 }}>
      {title && (
        <Txt variant="label" muted style={{ marginBottom: 7, marginLeft: 16 }}>
          {title}
        </Txt>
      )}
      <View style={[styles.card, { backgroundColor: colors.paper, padding: 0, overflow: 'hidden' }]}>{children}</View>
      {footer && (
        <Txt variant="caption" muted style={{ marginTop: 7, marginHorizontal: 16 }}>
          {footer}
        </Txt>
      )}
    </View>
  );
}

export function Screen({
  children,
  title,
  headerRight,
  refreshing,
  onRefresh,
  scroll = true,
  padded = true,
  scrollRef,
}: {
  children: ReactNode;
  /** Large title at the top of the page, iOS style. */
  title?: string;
  headerRight?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  padded?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const content = padded ? { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 } : undefined;
  const header = title ? (
    <View style={styles.largeTitleRow}>
      <Txt variant="largeTitle" accessibilityRole="header" style={{ flex: 1 }} numberOfLines={1}>
        {title}
      </Txt>
      {headerRight}
    </View>
  ) : null;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.page }}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={content}
          // Lets the native (glass) tab bar inset the content and minimise while scrolling.
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={colors.textSecondary} /> : undefined}
        >
          {header}
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>
          {header}
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

/** Round gray button with an SF Symbol, the iOS 26 way of closing sheets and offering small actions. */
export function CircleButton({ sf, ion, label, onPress }: { sf: SFSymbol; ion: IonName; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [styles.circle, { backgroundColor: colors.fill, opacity: pressed ? 0.6 : 1 }]}
    >
      <Icon sf={sf} ion={ion} size={15} color={colors.text} weight="bold" />
    </Pressable>
  );
}

export function Sheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: colors.page }}>
        <View style={styles.sheetHeader}>
          <View style={{ width: 32 }} />
          <Txt variant="body" style={{ fontWeight: '600' }} accessibilityRole="header">
            {title}
          </Txt>
          <CircleButton sf="xmark" ion="close" label={t('common.close')} onPress={onClose} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function Empty({ icon, sf = 'tray', title, subtitle }: { icon: IonName; sf?: SFSymbol; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <Icon sf={sf} ion={icon} size={44} color={colors.textDisabled} weight="regular" />
      <Txt variant="title" style={{ marginTop: 14, textAlign: 'center' }}>
        {title}
      </Txt>
      {subtitle && (
        <Txt variant="small" muted style={{ marginTop: 6, textAlign: 'center' }}>
          {subtitle}
        </Txt>
      )}
    </View>
  );
}

/** Failed load: what happened plus a way out, instead of a dead-end line of red text. */
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 40, paddingHorizontal: 24 }}>
      <Icon sf="wifi.exclamationmark" ion="cloud-offline-outline" size={40} color={colors.textDisabled} weight="regular" />
      <Txt variant="small" muted style={{ marginTop: 12, textAlign: 'center' }}>
        {message}
      </Txt>
      {onRetry && (
        <Button variant="secondary" icon="refresh" sf="arrow.clockwise" title={t('common.retry')} onPress={onRetry} style={{ marginTop: 16, alignSelf: 'stretch' }} />
      )}
    </View>
  );
}

export function Loading() {
  const { colors } = useTheme();
  return (
    <View style={{ paddingVertical: 48 }}>
      <ActivityIndicator color={colors.textSecondary} />
    </View>
  );
}

const styles = StyleSheet.create({
  // iOS 26 corners: generous and continuous.
  card: { borderRadius: 22, padding: 16, borderCurve: 'continuous' },
  button: { minHeight: 50, borderRadius: 25, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { minHeight: 50, borderRadius: 14, borderCurve: 'continuous', borderWidth: 1.5, paddingHorizontal: 16, fontFamily: fonts.body, fontSize: 17 },
  segmented: { flexDirection: 'row', borderRadius: 100, padding: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 7, borderRadius: 100, paddingHorizontal: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', minHeight: 52, paddingVertical: 11, paddingHorizontal: 16, gap: 12 },
  badge: { width: 30, height: 30, borderRadius: 8, borderCurve: 'continuous', alignItems: 'center', justifyContent: 'center' },
  separator: { position: 'absolute', right: 0, bottom: 0, height: StyleSheet.hairlineWidth },
  largeTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12, marginTop: 4 },
  circle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
});
