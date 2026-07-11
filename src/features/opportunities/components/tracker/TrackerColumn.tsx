import { memo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ScrollView, StyleSheet, View, type LayoutChangeEvent } from 'react-native';

import { Text } from '@/components/ui';
import { TrackerCard } from '@/features/opportunities/components/tracker/TrackerCard';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { spacing } from '@/constants/theme';
import { TRACKER_STAGE_LABELS, type TrackerStage } from '@/types/domain/tracker';

const COLUMN_WIDTH = 288;

type TrackerColumnProps = {
  stage: TrackerStage;
  items: TrackerItem[];
  draggingId: string | null;
  onLayout: (stage: TrackerStage, x: number, width: number) => void;
  onPressCard: (item: TrackerItem) => void;
  onAdvance: (item: TrackerItem) => void;
  onNotesCommit: (opportunityId: string, notes: string) => void;
  onDragStart: (item: TrackerItem) => void;
  onDragMove: (absoluteX: number, absoluteY: number) => void;
  onDragEnd: (absoluteX: number, absoluteY: number) => void;
};

function TrackerColumnComponent({
  stage,
  items,
  draggingId,
  onLayout,
  onPressCard,
  onAdvance,
  onNotesCommit,
  onDragStart,
  onDragMove,
  onDragEnd,
}: TrackerColumnProps) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const viewRef = useRef<View>(null);

  const handleLayout = (_e: LayoutChangeEvent) => {
    viewRef.current?.measureInWindow((x, _y, width) => {
      onLayout(stage, x, width);
    });
  };

  return (
    <View
      ref={viewRef}
      style={styles.column}
      onLayout={handleLayout}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{TRACKER_STAGE_LABELS[stage]}</Text>
        <View style={styles.countBadge}>
          <Text variant="caption" style={styles.countText}>
            {items.length}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled
      >
        {items.length === 0 ? (
          <View style={styles.empty}>
            <Text variant="caption" muted style={styles.emptyText}>
              {t(`opportunities.tracker.empty.${stage}`)}
            </Text>
          </View>
        ) : (
          items.map((item) => (
            <TrackerCard
              key={item.opportunityId}
              item={item}
              onPress={onPressCard}
              onAdvance={onAdvance}
              onNotesCommit={onNotesCommit}
              onDragStart={onDragStart}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              isDragging={draggingId === item.opportunityId}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

export const TrackerColumn = memo(TrackerColumnComponent);
export const TRACKER_COLUMN_WIDTH = COLUMN_WIDTH;

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  column: {
    width: COLUMN_WIDTH,
    height: '100%',
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  headerTitle: { fontWeight: '700', fontSize: 15, color: colors.text },
  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  countText: { color: colors.background, fontWeight: '700' },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.sm, paddingBottom: spacing.lg },
  empty: {
    padding: spacing.md,
    minHeight: 120,
    justifyContent: 'center',
  },
  emptyText: { textAlign: 'center', lineHeight: 20 },
});
}
