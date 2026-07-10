import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { PieChart } from 'react-native-gifted-charts';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import type { ChartDatum } from '@/features/admin/types/analytics';

const OTHER_SLICE_COLORS = [
  '#5C6BC0',
  '#26A69A',
  '#FFA726',
  '#AB47BC',
  '#EF5350',
  '#8D6E63',
  '#78909C',
];

type AdminPieChartProps = {
  title: string;
  data: ChartDatum[];
};

export function AdminPieChart({ title, data }: AdminPieChartProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const sliceColors = [colors.primary, ...OTHER_SLICE_COLORS];
  if (data.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text muted>No data yet</Text>
      </View>
    );
  }

  const pieData = data.map((item, index) => ({
    value: item.value,
    text: String(item.value),
    color: sliceColors[index % sliceColors.length],
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.chartRow}>
        <PieChart
          data={pieData}
          donut
          radius={90}
          innerRadius={50}
          innerCircleColor={colors.background}
          isAnimated
        />
        <View style={styles.legend}>
          {data.map((item, index) => (
            <View key={item.label} style={styles.legendRow}>
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: sliceColors[index % sliceColors.length] },
                ]}
              />
              <Text style={styles.legendText} numberOfLines={1}>
                {item.label} ({item.value})
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { gap: spacing.sm, paddingVertical: spacing.sm },
  title: { fontWeight: '600', fontSize: 15, color: colors.text },
  chartRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  legend: { flex: 1, gap: spacing.xs },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  swatch: { width: 10, height: 10, borderRadius: 5 },
  legendText: { flex: 1, fontSize: 12, color: colors.text },
});
}
