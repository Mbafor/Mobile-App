import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';

type Props = PropsWithChildren<{
  title: string;
  subtitle?: string;
  onBack?: () => void;
}>;

export function AuthScreenLayout({ title, subtitle, onBack, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { paddingTop: insets.top }]}>
      <View style={styles.hero}>
        {onBack ? (
          <Pressable onPress={onBack} hitSlop={12}>
            <Text style={styles.back}>← Back</Text>
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

const styles = StyleSheet.create({
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
  scroll: { paddingHorizontal: spacing.md, flexGrow: 1 },
  card: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    minHeight: 360,
  },
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg, lineHeight: 22 },
});
