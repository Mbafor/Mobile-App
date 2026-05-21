import { StyleSheet, View } from 'react-native';

import { StatCard } from '@/features/dashboard/components/StatCard';
import { spacing } from '@/constants/theme';

type DashboardStatsRowProps = {
  savedCount: number;
  appliedCount: number;
};

export function DashboardStatsRow({ savedCount, appliedCount }: DashboardStatsRowProps) {
  return (
    <View style={styles.row}>
      <StatCard label="Saved" value={savedCount} />
      <StatCard label="Applied" value={appliedCount} accent />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
});
