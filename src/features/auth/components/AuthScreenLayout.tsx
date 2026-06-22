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

import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';

const DESKTOP_BREAKPOINT = 768;
const CARD_MAX_WIDTH = 460;

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backgroundColor?: string;
  backTextColor?: string;
}>;

export function AuthScreenLayout({
  title,
  subtitle,
  onBack,
  children,
  backgroundColor,
  backTextColor,
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
                <Text style={[styles.backText, { color: colors.textMuted }]}>← Back</Text>
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
      <View style={styles.mobileHero}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={[styles.backText, { color: backTextColor ?? colors.background }]}>
              ← Back
            </Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <View style={styles.card}>
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
    mobileHero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
    backSpacer: { height: 28, marginBottom: spacing.sm },
    backText: { marginBottom: spacing.sm },
    scroll: { flexGrow: 1 },
    card: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: spacing.lg,
      minHeight: 360,
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
