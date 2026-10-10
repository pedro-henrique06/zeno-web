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
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import { brand, fonts, useTheme } from '@/theme/ThemeContext';

type TxtVariant = 'body' | 'small' | 'caption' | 'label' | 'title' | 'heading' | 'display';

const VARIANTS: Record<TxtVariant, TextStyle> = {
  body: { fontFamily: fonts.body, fontSize: 16 },
  small: { fontFamily: fonts.body, fontSize: 14 },
  caption: { fontFamily: fonts.body, fontSize: 12 },
  label: { fontFamily: fonts.bold, fontSize: 11, letterSpacing: 1.1, textTransform: 'uppercase' },
  title: { fontFamily: fonts.bold, fontSize: 18 },
  heading: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.5 },
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

/** Money / numbers: serif face, tabular figures. */
export function Money({ style, ...rest }: TextProps & { color?: string }) {
  return <Txt {...rest} style={[{ fontFamily: fonts.display, fontVariant: ['tabular-nums'] }, style]} />;
}

export function Card({ children, style, dark }: { children: ReactNode; style?: StyleProp<ViewStyle>; dark?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.card,
        dark
          ? { backgroundColor: brand.navy }
          : { backgroundColor: colors.paper, borderColor: colors.divider, borderWidth: StyleSheet.hairlineWidth },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const bg =
    variant === 'primary' ? brand.blueAction : variant === 'danger' ? brand.expenseDark : variant === 'secondary' ? colors.raised : 'transparent';
  const fg = variant === 'secondary' || variant === 'ghost' ? colors.text : '#fff';
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
        { backgroundColor: bg, opacity: inactive ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'secondary' && { borderColor: colors.divider, borderWidth: StyleSheet.hairlineWidth },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <View style={styles.row}>
          {icon && <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} />}
          <Text style={{ color: fg, fontFamily: fonts.bold, fontSize: 16 }}>{title}</Text>
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
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ marginBottom: 14 }}>
      {label && (
        <Txt variant="label" muted style={{ marginBottom: 6 }}>
          {label}
        </Txt>
      )}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={colors.textDisabled}
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
              borderColor: error ? colors.expense : focused ? brand.blue : colors.divider,
            },
            trailing ? { paddingRight: 48 } : null,
            style,
          ]}
        />
        {trailing ? <View style={{ position: 'absolute', right: 4 }}>{trailing}</View> : null}
      </View>
      {error ? (
        <Txt variant="caption" color={colors.expense} style={{ marginTop: 4 }}>
          {error}
        </Txt>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={[styles.segmented, { backgroundColor: brand.navy }]}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && { backgroundColor: brand.navySurface }]}
          >
            <Text
              numberOfLines={1}
              style={{
                fontFamily: fonts.medium,
                fontSize: 12,
                color: active ? (o.color ?? brand.blue) : 'rgba(255,255,255,0.7)',
              }}
            >
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Row({
  title,
  subtitle,
  icon,
  danger,
  right,
  onPress,
  last,
}: {
  title: string;
  subtitle?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  danger?: boolean;
  right?: ReactNode;
  onPress?: () => void;
  last?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.listRow,
        { borderBottomColor: colors.divider, borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth },
        pressed && { backgroundColor: colors.hover },
      ]}
    >
      {icon && (
        <View style={[styles.badge, { backgroundColor: danger ? brand.expense + '20' : brand.navy }]}>
          <Ionicons name={icon} size={18} color={danger ? colors.expense : brand.blue} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <Txt variant="body" color={danger ? colors.expense : undefined} style={{ fontFamily: fonts.medium }}>
          {title}
        </Txt>
        {subtitle ? (
          <Txt variant="small" muted>
            {subtitle}
          </Txt>
        ) : null}
      </View>
      {right ?? (onPress && !danger ? <Ionicons name="chevron-forward" size={18} color={colors.textDisabled} /> : null)}
    </Pressable>
  );
}

export function Section({ title, children }: { title?: string; children: ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={{ marginTop: 22 }}>
      {title && (
        <Txt variant="label" muted style={{ marginBottom: 8, marginLeft: 4 }}>
          {title}
        </Txt>
      )}
      <View
        style={[
          styles.card,
          { backgroundColor: colors.paper, borderColor: colors.divider, borderWidth: StyleSheet.hairlineWidth, padding: 0, overflow: 'hidden' },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

/** Bottom space a screen needs so its last row isn't hidden behind the <Fab />. */
export const FAB_CLEARANCE = 96;

export function Screen({
  children,
  refreshing,
  onRefresh,
  scroll = true,
  padded = true,
  withFab,
  scrollRef,
}: {
  children: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  scroll?: boolean;
  padded?: boolean;
  withFab?: boolean;
  scrollRef?: RefObject<ScrollView | null>;
}) {
  const { colors } = useTheme();
  const content = padded ? { padding: 16, paddingBottom: withFab ? FAB_CLEARANCE : 40 } : undefined;
  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: colors.page }}>
      {scroll ? (
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={content}
          keyboardShouldPersistTaps="handled"
          refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={brand.blue} /> : undefined}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[{ flex: 1 }, content]}>{children}</View>
      )}
    </SafeAreaView>
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
        <View style={[styles.sheetHeader, { borderBottomColor: colors.divider }]}>
          <Txt variant="title">{title}</Txt>
          <Pressable accessibilityRole="button" accessibilityLabel={t('common.close')} onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={colors.textSecondary} />
          </Pressable>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Floating "new entry" button, bottom-right. Pair with <Screen withFab />. */
export function Fab({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.fab, { opacity: pressed ? 0.85 : 1 }]}
    >
      <Ionicons name="add" size={30} color="#fff" />
    </Pressable>
  );
}

export function Empty({ icon, title, subtitle }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24 }}>
      <Ionicons name={icon} size={44} color={colors.textDisabled} />
      <Txt variant="title" style={{ marginTop: 12, textAlign: 'center' }}>
        {title}
      </Txt>
      {subtitle && (
        <Txt variant="small" muted style={{ marginTop: 4, textAlign: 'center' }}>
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
      <Ionicons name="cloud-offline-outline" size={40} color={colors.textDisabled} />
      <Txt variant="small" muted style={{ marginTop: 12, textAlign: 'center' }}>
        {message}
      </Txt>
      {onRetry && <Button variant="secondary" icon="refresh" title={t('common.retry')} onPress={onRetry} style={{ marginTop: 16, alignSelf: 'stretch' }} />}
    </View>
  );
}

export function Loading() {
  return (
    <View style={{ paddingVertical: 48 }}>
      <ActivityIndicator color={brand.blue} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, padding: 16 },
  button: { minHeight: 50, borderRadius: 14, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  row: { flexDirection: 'row', alignItems: 'center' },
  input: { minHeight: 50, borderRadius: 12, borderWidth: 1.5, paddingHorizontal: 14, fontFamily: fonts.body, fontSize: 16 },
  segmented: { flexDirection: 'row', borderRadius: 12, padding: 3 },
  segment: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 9, borderRadius: 10, paddingHorizontal: 4 },
  listRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 13, paddingHorizontal: 14, gap: 12 },
  badge: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: brand.blueAction,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: StyleSheet.hairlineWidth },
});
