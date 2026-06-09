import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';

type AdminStatCardProps = {
  label: string;
  value: number | string;
};

export function AdminStatCard({ label, value }: AdminStatCardProps) {
  const styles = useThemedStyles(createStyles);
  return (
    <View style={styles.card}>
      <Text style={styles.value}>{value}</Text>
      <Text muted style={styles.label}>
        {label}
      </Text>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  value: { fontSize: 28, fontWeight: '700', color: colors.text },
  label: { fontSize: 13 },
});
}
