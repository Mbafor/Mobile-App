import type { PropsWithChildren } from 'react';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';

const DESKTOP_BREAKPOINT = 768;
const CARD_MAX_WIDTH = 460;

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backgroundColor?: string;
}>;

export function AuthScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  backgroundColor,
}: Props) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= DESKTOP_BREAKPOINT;

  // ── Desktop: centered card on coloured background ─────────────────────────
  if (isDesktop) {
    return (
      <View
        style={[
          styles.desktopRoot,
          { paddingTop: insets.top, backgroundColor: backgroundColor ?? colors.primary },
        ]}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[
            styles.desktopScroll,
            { paddingBottom: insets.bottom + spacing.xl },
          ]}
        >
          <View style={styles.desktopCard}>
            {onBack && (
              <Pressable onPress={onBack} hitSlop={12} style={styles.desktopBack}>
                <Text style={{ color: colors.textMuted }}>← Back</Text>
              </Pressable>
            )}
            <Text variant="title" style={styles.desktopTitle}>{title}</Text>
            {subtitle ? (
              <Text muted style={styles.subtitle}>{subtitle}</Text>
            ) : null}
            {children}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Mobile: primary header + white card slides up from bottom ─────────────
  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: backgroundColor ?? colors.primary },
      ]}
    >
      <View style={styles.mobileHero} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.card}>
            {onBack ? (
              <Pressable onPress={onBack} hitSlop={12} style={styles.backBtn}>
                <Ionicons name="chevron-back" size={16} color={colors.text} />
                <Text style={styles.backBtnText}>Back</Text>
              </Pressable>
            ) : null}
            <Text variant="title">{title}</Text>
            {subtitle ? <Text muted style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    // ── Mobile ──────────────────────────────────────────────────────────────
    root: { flex: 1, backgroundColor: colors.primary },
    flex: { flex: 1 },
    mobileHero: { height: spacing.lg },
    scroll: { flexGrow: 1 },
    card: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: spacing.lg,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.lg,
      minHeight: 360,
    },
    backBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 20,
      paddingVertical: 6,
      paddingHorizontal: 12,
      marginBottom: spacing.md,
    },
    backBtnText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontWeight: '500',
      marginLeft: 2,
    },

    // ── Desktop ─────────────────────────────────────────────────────────────
    desktopRoot: {
      flex: 1,
    },
    desktopScroll: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl * 2,
    },
    desktopCard: {
      width: '100%',
      maxWidth: CARD_MAX_WIDTH,
      backgroundColor: colors.background,
      borderRadius: 20,
      padding: spacing.xl,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 24,
      // @ts-ignore — web only
      boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
    },
    desktopBack: {
      marginBottom: spacing.md,
    },
    desktopTitle: {
      marginBottom: spacing.xs,
    },

    // ── Shared ──────────────────────────────────────────────────────────────
    subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 22 },
  });
}
