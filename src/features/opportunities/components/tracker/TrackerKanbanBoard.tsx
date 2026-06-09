import { useCallback, useRef, useState } from 'react';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import {
  TrackerColumn,
  TRACKER_COLUMN_WIDTH,
} from '@/features/opportunities/components/tracker/TrackerColumn';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { spacing } from '@/constants/theme';
import {
  TRACKER_STAGE_ORDER,
  type TrackerStage,
} from '@/types/domain/tracker';

type TrackerKanbanBoardProps = {
  grouped: Record<TrackerStage, TrackerItem[]>;
  onPressCard: (item: TrackerItem) => void;
  onAdvance: (item: TrackerItem) => void;
  onNotesCommit: (opportunityId: string, notes: string) => void;
  onMoveToStage: (opportunityId: string, stage: TrackerStage) => void;
  refreshing?: boolean;
  onRefresh?: () => void;
};

export function TrackerKanbanBoard({
  grouped,
  onPressCard,
  onAdvance,
  onNotesCommit,
  onMoveToStage,
  refreshing = false,
  onRefresh,
}: TrackerKanbanBoardProps) {
  const styles = useThemedStyles(createStyles);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const draggingIdRef = useRef<string | null>(null);
  const columnBounds = useRef<Partial<Record<TrackerStage, { x: number; width: number }>>>({});

  const handleColumnLayout = useCallback((stage: TrackerStage, x: number, width: number) => {
    columnBounds.current[stage] = { x, width };
  }, []);

  const resolveStageAt = useCallback((absoluteX: number): TrackerStage | null => {
    for (const stage of TRACKER_STAGE_ORDER) {
      const bounds = columnBounds.current[stage];
      if (!bounds) continue;
      if (absoluteX >= bounds.x && absoluteX <= bounds.x + bounds.width) {
        return stage;
      }
    }
    return null;
  }, []);

  const handleDragStart = useCallback((item: TrackerItem) => {
    draggingIdRef.current = item.opportunityId;
    setDraggingId(item.opportunityId);
  }, []);

  const handleDragEnd = useCallback(
    (absoluteX: number, _absoluteY: number) => {
      const id = draggingIdRef.current;
      draggingIdRef.current = null;
      setDraggingId(null);
      if (!id) return;
      const targetStage = resolveStageAt(absoluteX);
      if (targetStage) {
        onMoveToStage(id, targetStage);
      }
    },
    [onMoveToStage, resolveStageAt],
  );

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        decelerationRate="fast"
        snapToInterval={TRACKER_COLUMN_WIDTH + spacing.md}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          ) : undefined
        }
      >
        {TRACKER_STAGE_ORDER.map((stage) => (
          <TrackerColumn
            key={stage}
            stage={stage}
            items={grouped[stage]}
            draggingId={draggingId}
            onLayout={handleColumnLayout}
            onPressCard={onPressCard}
            onAdvance={onAdvance}
            onNotesCommit={onNotesCommit}
            onDragStart={handleDragStart}
            onDragMove={() => {}}
            onDragEnd={handleDragEnd}
          />
        ))}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  wrap: { flex: 1 },
  row: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    alignItems: 'stretch',
    flexGrow: 1,
  },
});
}
