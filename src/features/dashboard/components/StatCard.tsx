import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/theme';

type StatCardProps = {
  label: string;
  value: number | string;
  accent?: boolean;
};

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <View style={[styles.card, accent && styles.cardAccent]}>
      <Text style={[styles.value, accent && styles.valueAccent]}>{value}</Text>
      <Text variant="caption" style={[styles.label, accent && styles.labelAccent]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    gap: spacing.xs,
  },
  cardAccent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  value: {
    fontSize: typography.fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  valueAccent: { color: colors.background },
  label: { color: colors.textMuted, textAlign: 'center' },
  labelAccent: { color: colors.background },
});
