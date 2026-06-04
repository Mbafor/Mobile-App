import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { SearchField, Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { TrackerKanbanBoard } from '@/features/opportunities/components/tracker/TrackerKanbanBoard';
import { useTrackerOpportunities } from '@/features/opportunities/hooks/useTrackerOpportunities';
import {
  filterTrackerItems,
  groupByStage,
} from '@/features/opportunities/utils/filter-tracker';
import { exportTrackerToXlsx } from '@/features/opportunities/utils/export-tracker-xlsx';
import { colors, spacing } from '@/constants/theme';
import {
  EMPTY_TRACKER_FILTERS,
  nextTrackerStage,
  type TrackerStage,
} from '@/types/domain/tracker';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';

export function TrackerScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const {
    items,
    isLoading,
    isRefetching,
    error,
    refetch,
    updateStage,
    updateNotes,
  } = useTrackerOpportunities();

  const filteredItems = useMemo(
    () => filterTrackerItems(items, query, EMPTY_TRACKER_FILTERS),
    [items, query],
  );

  const grouped = useMemo(() => groupByStage(filteredItems), [filteredItems]);

  const handlePressCard = useCallback(
    (item: TrackerItem) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: item.opportunity.id },
      });
    },
    [router],
  );

  const handleAdvance = useCallback(
    (item: TrackerItem) => {
      const next = nextTrackerStage(item.stage);
      if (!next) return;
      updateStage({ opportunityId: item.opportunityId, stage: next });
    },
    [updateStage],
  );

  const handleMoveToStage = useCallback(
    (opportunityId: string, stage: TrackerStage) => {
      const current = items.find((i) => i.opportunityId === opportunityId);
      if (!current || current.stage === stage) return;
      updateStage({ opportunityId, stage });
    },
    [items, updateStage],
  );

  const handleNotesCommit = useCallback(
    (opportunityId: string, notes: string) => {
      updateNotes({ opportunityId, notes });
    },
    [updateNotes],
  );

  const handleExport = useCallback(async () => {
    if (filteredItems.length === 0) {
      Alert.alert('Nothing to export', 'Add items to your tracker first.');
      return;
    }
    setExporting(true);
    try {
      const label = query.trim() ? 'filtered' : 'all';
      await exportTrackerToXlsx(filteredItems, label);
    } catch (e) {
      Alert.alert(
        'Export failed',
        e instanceof Error ? e.message : 'Could not create the spreadsheet.',
      );
    } finally {
      setExporting(false);
    }
  }, [filteredItems, query]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error ? (
        <View style={styles.banner}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load your tracker'}
          />
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder="Search title or company…"
          />
        </View>
        <Button
          variant="secondary"
          loading={exporting}
          onPress={() => void handleExport()}
          style={styles.exportBtn}
        >
          Export .xlsx
        </Button>
      </View>

      <View style={styles.countRow}>
        <Text variant="caption" muted>
          {filteredItems.length} {filteredItems.length === 1 ? 'card' : 'cards'}
          {query.trim() ? ' (filtered)' : ''}
        </Text>
      </View>

      <TrackerKanbanBoard
        grouped={grouped}
        onPressCard={handlePressCard}
        onAdvance={handleAdvance}
        onNotesCommit={handleNotesCommit}
        onMoveToStage={handleMoveToStage}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  banner: { padding: spacing.md },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchWrap: { flex: 1 },
  exportBtn: { flexShrink: 0 },
  countRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
});
