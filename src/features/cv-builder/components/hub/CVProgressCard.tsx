import { StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { getProgressMessage } from '@/features/cv-builder/utils/section-config';

type CVProgressCardProps = {
  percent: number;
  enabledCount: number;
};

export function CVProgressCard({ percent, enabledCount }: CVProgressCardProps) {
  const styles = useThemedStyles(createStyles);
  const segments = Math.min(enabledCount, 8);
  const filledSegments = Math.round((percent / 100) * segments);

  return (
    <View style={styles.card}>
      <View style={styles.copy}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>Your CV Progress</Text>
          <Text style={styles.percent}>{percent}% Complete</Text>
        </View>
        <View style={styles.bar}>
          {Array.from({ length: segments }, (_, i) => (
            <View
              key={i}
              style={[styles.segment, i < filledSegments && styles.segmentFilled]}
            />
          ))}
        </View>
        <Text muted variant="caption" style={styles.hint}>
          {getProgressMessage(percent)}
        </Text>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  copy: { gap: spacing.sm },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  percent: { fontSize: 14, fontWeight: '700', color: colors.primary },
  bar: { flexDirection: 'row', gap: 4 },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    minWidth: 12,
  },
  segmentFilled: { backgroundColor: colors.primary },
  hint: { lineHeight: 18 },
});
}
