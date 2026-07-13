import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { Pressable, ScrollView, StyleSheet } from 'react-native';

import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { TRACKER_STAGE_ORDER, type TrackerStage } from '@/types/domain/tracker';

export type TrackerFilterValue = 'all' | TrackerStage;

type TrackerFilterChipsProps = {
  selected: TrackerFilterValue;
  onSelect: (value: TrackerFilterValue) => void;
  totalCount: number;
  stageCounts: Record<TrackerStage, number>;
};

export function TrackerFilterChips({
  selected,
  onSelect,
  totalCount,
  stageCounts,
}: TrackerFilterChipsProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();

  const options: { value: TrackerFilterValue; label: string; count: number }[] = [
    { value: 'all', label: t('opportunities.tracker.filterAll'), count: totalCount },
    ...TRACKER_STAGE_ORDER.map((stage) => ({
      value: stage,
      label: t(`opportunities.tracker.stages.${stage}`),
      count: stageCounts[stage],
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map((opt) => {
        const active = opt.value === selected;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onSelect(opt.value)}
            style={[styles.chip, active && styles.chipActive]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>
              {opt.label}
              <Text style={[styles.chipCount, active && styles.chipCountActive]}>
                {' '}
                {opt.count}
              </Text>
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    // react-native-web's ScrollView defaults to flexGrow: 1 even when horizontal,
    // which makes it balloon to fill the parent column's remaining height. Pin it
    // to its content height instead.
    scroll: { flexGrow: 0, flexShrink: 0 },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 7,
      paddingHorizontal: spacing.md,
      paddingBottom: spacing.sm,
    },
    chip: {
      flexShrink: 0,
      paddingVertical: 7,
      paddingHorizontal: spacing.sm + 5,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: { fontSize: 12.5, fontWeight: '600', color: colors.textMuted },
    chipTextActive: { color: colors.textOnPrimary },
    chipCount: { opacity: 0.75, color: colors.textMuted },
    chipCountActive: { color: colors.textOnPrimary, opacity: 0.85 },
  });
}
