import { Dimensions, StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { BarChart } from 'react-native-gifted-charts';
import { useTranslation } from 'react-i18next';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import type { ChartDatum } from '@/features/admin/types/analytics';

type AdminBarChartProps = {
  title: string;
  data: ChartDatum[];
};

const CHART_WIDTH = Dimensions.get('window').width - spacing.md * 4;

export function AdminBarChart({ title, data }: AdminBarChartProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  if (data.length === 0) {
    return (
      <View style={styles.wrap}>
        <Text style={styles.title}>{title}</Text>
        <Text muted>{t('admin.charts.noData')}</Text>
      </View>
    );
  }

  const maxValue = Math.max(...data.map((d) => d.value), 1);
  const barData = data.map((item) => ({
    value: item.value,
    label: item.label.length > 10 ? `${item.label.slice(0, 9)}…` : item.label,
    frontColor: colors.primary,
  }));

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <BarChart
        data={barData}
        width={CHART_WIDTH}
        height={180}
        barWidth={28}
        spacing={18}
        roundedTop
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor={colors.border}
        yAxisTextStyle={{ color: colors.textMuted }}
        xAxisLabelTextStyle={{ color: colors.textMuted }}
        noOfSections={4}
        maxValue={maxValue}
        isAnimated
      />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  title: { fontWeight: '600', fontSize: 15, color: colors.text },
});
}
