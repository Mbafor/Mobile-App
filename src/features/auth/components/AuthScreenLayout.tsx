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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ResponsiveContainer } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing, typography } from '@/constants/theme';

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

  return (
    <View
      style={[
        styles.root,
        { paddingTop: insets.top, backgroundColor: backgroundColor ?? colors.primary },
      ]}
    >
      <ResponsiveContainer style={styles.hero} maxWidth={960} minHorizontalPadding={spacing.lg}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={[styles.back, { color: backTextColor ?? colors.background }]}>← Back</Text>
          </Pressable>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </ResponsiveContainer>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + spacing.lg }]}
        >
          <ResponsiveContainer maxWidth={960} minHorizontalPadding={spacing.md}>
            <View style={styles.card}>
              <Text variant="title">{title}</Text>
              {subtitle ? <Text muted style={styles.subtitle}>{subtitle}</Text> : null}
              {children}
            </View>
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.primary },
  flex: { flex: 1 },
  hero: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  back: { color: colors.background, marginBottom: spacing.sm },
  backSpacer: { height: 28, marginBottom: spacing.sm },
  brand: {
    color: colors.background,
    fontSize: typography.fontSize.sm,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
  scroll: { flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    minHeight: 360,
  },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 22 },
});
}
