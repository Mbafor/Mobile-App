import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { SearchField, Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { TrackerFilterChips, type TrackerFilterValue } from '@/features/opportunities/components/tracker/TrackerFilterChips';
import { TrackerListCard } from '@/features/opportunities/components/tracker/TrackerListCard';
import { TrackerStalledBanner } from '@/features/opportunities/components/tracker/TrackerStalledBanner';
import { TrackerStatusSheet } from '@/features/opportunities/components/tracker/TrackerStatusSheet';
import { TrackerUndoToast } from '@/features/opportunities/components/tracker/TrackerUndoToast';
import { useInlineSearchToggle } from '@/features/menu/store/inline-search-toggle.store';
import { useTrackerOpportunities } from '@/features/opportunities/hooks/useTrackerOpportunities';
import { filterTrackerItems, groupByStage } from '@/features/opportunities/utils/filter-tracker';
import { findStalledItems, type StalledEntry } from '@/features/opportunities/utils/tracker-stalled';
import { resolveStatusTransition } from '@/features/opportunities/utils/tracker-status-transition';
import { exportTrackerToXlsx } from '@/features/opportunities/utils/export-tracker-xlsx';
import { spacing } from '@/constants/theme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { EMPTY_TRACKER_FILTERS, TRACKER_STAGE_ORDER, type TrackerStage } from '@/types/domain/tracker';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';

function sortByDeadlineAscending(items: TrackerItem[]): TrackerItem[] {
  return [...items].sort((a, b) => {
    const aTime = a.opportunity.deadline ? new Date(a.opportunity.deadline).getTime() : Infinity;
    const bTime = b.opportunity.deadline ? new Date(b.opportunity.deadline).getTime() : Infinity;
    return aTime - bTime;
  });
}

const HIGHLIGHT_DURATION_MS = 2500;

export function TrackerScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktop = useWebDesktop();
  const listRef = useRef<FlatList<TrackerItem>>(null);

  const searchOpen = useInlineSearchToggle((s) => s.open);
  const setSearchOpen = useInlineSearchToggle((s) => s.setOpen);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchOpen(false);
    }, [setSearchOpen]),
  );

  const [exporting, setExporting] = useState(false);
  const [stageFilter, setStageFilter] = useState<TrackerFilterValue>('all');
  const [sheetItem, setSheetItem] = useState<TrackerItem | null>(null);
  const [dismissedStalledIds, setDismissedStalledIds] = useState<Set<string>>(new Set());
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [pendingScrollId, setPendingScrollId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; onUndo: () => void } | null>(null);

  const {
    items,
    isLoading,
    isRefetching,
    error,
    refetch,
    updateStage,
    updateNotes,
  } = useTrackerOpportunities();

  const queryFilteredItems = useMemo(
    () => filterTrackerItems(items, query, EMPTY_TRACKER_FILTERS),
    [items, query],
  );

  const stageCounts = useMemo(() => {
    const grouped = groupByStage(queryFilteredItems);
    return TRACKER_STAGE_ORDER.reduce(
      (acc, stage) => ({ ...acc, [stage]: grouped[stage].length }),
      {} as Record<TrackerStage, number>,
    );
  }, [queryFilteredItems]);

  const visibleItems = useMemo(() => {
    const byStage =
      stageFilter === 'all'
        ? queryFilteredItems
        : queryFilteredItems.filter((item) => item.stage === stageFilter);
    return sortByDeadlineAscending(byStage);
  }, [queryFilteredItems, stageFilter]);

  const stalledEntries = useMemo(() => findStalledItems(items), [items]);
  const activeStalled: StalledEntry | undefined = stalledEntries.find(
    (entry) => !dismissedStalledIds.has(entry.item.opportunityId),
  );

  useEffect(() => {
    if (!pendingScrollId) return;
    const index = visibleItems.findIndex((item) => item.opportunityId === pendingScrollId);
    if (index < 0) return;
    listRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.3 });
    setHighlightedId(pendingScrollId);
    setPendingScrollId(null);
    const timer = setTimeout(() => setHighlightedId(null), HIGHLIGHT_DURATION_MS);
    return () => clearTimeout(timer);
  }, [pendingScrollId, visibleItems]);

  const handlePressStalledBanner = useCallback((entry: StalledEntry) => {
    setStageFilter('all');
    setQuery('');
    setPendingScrollId(entry.item.opportunityId);
  }, []);

  const handleDismissStalledBanner = useCallback((opportunityId: string) => {
    setDismissedStalledIds((prev) => new Set(prev).add(opportunityId));
  }, []);

  const handlePressCard = useCallback(
    (item: TrackerItem) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: item.opportunity.id },
      });
    },
    [router],
  );

  const handleSelectStatus = useCallback(
    (pickedStage: TrackerStage) => {
      if (!sheetItem) return;
      setSheetItem(null);

      const transition = resolveStatusTransition(sheetItem, pickedStage);
      if (!transition) return;

      const { opportunityId, stage, previousStage } = transition;
      updateStage({ opportunityId, stage });
      setToast({
        message: t('opportunities.tracker.toastMarkedAs', {
          status: t(`opportunities.tracker.stages.${stage}`),
        }),
        onUndo: () => {
          updateStage({ opportunityId, stage: previousStage });
          setToast(null);
        },
      });
    },
    [sheetItem, updateStage, t],
  );

  const handleNotesCommit = useCallback(
    (opportunityId: string, notes: string) => {
      updateNotes({ opportunityId, notes });
    },
    [updateNotes],
  );

  const handleExport = useCallback(async () => {
    if (visibleItems.length === 0) {
      Alert.alert(t('opportunities.tracker.nothingToExportTitle'), t('opportunities.tracker.nothingToExportBody'));
      return;
    }
    setExporting(true);
    try {
      const label = query.trim() || stageFilter !== 'all' ? 'filtered' : 'all';
      await exportTrackerToXlsx(visibleItems, label);
    } catch (e) {
      Alert.alert(
        t('opportunities.tracker.exportFailedTitle'),
        e instanceof Error ? e.message : t('opportunities.tracker.exportFailedBody'),
      );
    } finally {
      setExporting(false);
    }
  }, [visibleItems, query, stageFilter, t]);

  const renderItem = useCallback(
    ({ item }: { item: TrackerItem }) => (
      <TrackerListCard
        item={item}
        onPress={handlePressCard}
        onOpenStatusSheet={setSheetItem}
        onNotesCommit={handleNotesCommit}
        highlighted={item.opportunityId === highlightedId}
      />
    ),
    [handlePressCard, handleNotesCommit, highlightedId],
  );

  const emptyKey = stageFilter === 'all' ? 'all' : stageFilter;

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
            message={error instanceof Error ? error.message : t('opportunities.tracker.loadFailed')}
          />
        </View>
      ) : null}

      {searchOpen ? (
        <View style={styles.searchWrap}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('opportunities.tracker.searchPlaceholder')}
            style={isDesktop && styles.searchFieldDesktop}
            autoFocus
          />
        </View>
      ) : null}

      <TrackerFilterChips
        selected={stageFilter}
        onSelect={setStageFilter}
        totalCount={queryFilteredItems.length}
        stageCounts={stageCounts}
      />

      {activeStalled ? (
        <TrackerStalledBanner
          entry={activeStalled}
          onPress={() => handlePressStalledBanner(activeStalled)}
          onDismiss={() => handleDismissStalledBanner(activeStalled.item.opportunityId)}
        />
      ) : null}

      <FlatList
        ref={listRef}
        style={styles.list}
        data={visibleItems}
        keyExtractor={(item) => item.opportunityId}
        renderItem={renderItem}
        refreshing={isRefetching}
        onRefresh={() => void refetch()}
        contentContainerStyle={styles.listContent}
        onScrollToIndexFailed={() => {}}
        ListEmptyComponent={
          <Text muted style={styles.emptyText}>
            {t(`opportunities.tracker.empty.${emptyKey}`)}
          </Text>
        }
        ListFooterComponent={
          <View style={styles.footer}>
            <Button
              loading={exporting}
              onPress={() => void handleExport()}
              style={styles.exportBtn}
            >
              {t('opportunities.tracker.export')}
            </Button>
          </View>
        }
      />

      <TrackerStatusSheet
        visible={sheetItem !== null}
        currentStage={sheetItem?.stage ?? null}
        onSelect={handleSelectStatus}
        onClose={() => setSheetItem(null)}
      />

      <TrackerUndoToast
        visible={toast !== null}
        message={toast?.message ?? ''}
        onUndo={() => toast?.onUndo()}
        onHide={() => setToast(null)}
      />
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingTop: spacing.sm,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  banner: { padding: spacing.md },
  searchWrap: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm },
  searchFieldDesktop: { maxWidth: 360 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  exportBtn: { flexShrink: 0 },
  list: { flex: 1 },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
});
}
