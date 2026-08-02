import { Ionicons } from '@expo/vector-icons';
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
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<TrackerItem>>(null);

  const setSearchOpen = useInlineSearchToggle((s) => s.setOpen);
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

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

  const activeFilterCount = stageFilter === 'all' ? 0 : 1;

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
      <View style={styles.intro}>
        <View style={[styles.headerRow, isDesktop && styles.headerRowDesktop]}>
          <Text style={styles.introTitle}>{t('opportunities.tracker.intro.title')}</Text>

          <View style={[styles.searchRow, isDesktop && styles.searchRowDesktop]}>
            <View style={styles.searchField}>
              <SearchField
                value={query}
                onChangeText={setQuery}
                placeholder={t('opportunities.tracker.searchPlaceholder')}
              />
            </View>
            <Pressable
              style={styles.filterBtn}
              onPress={() => setFiltersOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={t('opportunities.tracker.filters')}
            >
              <Ionicons name="options-outline" size={18} color={colors.text} />
              {activeFilterCount > 0 ? (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
                </View>
              ) : null}
            </Pressable>
          </View>
        </View>
        <Text style={styles.introBody}>{t('opportunities.tracker.intro.body')}</Text>
      </View>

      {error ? (
        <View style={styles.banner}>
          <ErrorMessage
            message={error instanceof Error ? error.message : t('opportunities.tracker.loadFailed')}
          />
        </View>
      ) : null}

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

      <Modal
        visible={filtersOpen}
        transparent
        animationType={isDesktop ? 'fade' : 'slide'}
        onRequestClose={() => setFiltersOpen(false)}
      >
        <Pressable
          style={[styles.sheetOverlay, isDesktop && styles.sheetOverlayDesktop]}
          onPress={() => setFiltersOpen(false)}
        >
          <Pressable
            style={[
              styles.sheet,
              { paddingBottom: insets.bottom + spacing.md },
              isDesktop && styles.sheetDesktop,
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeaderRow}>
              <Text style={styles.sheetTitle}>{t('opportunities.tracker.filters')}</Text>
              <Pressable onPress={() => setFiltersOpen(false)} hitSlop={12}>
                <Ionicons name="close" size={22} color={colors.textMuted} />
              </Pressable>
            </View>

            <View style={styles.filterGroup}>
              <Text style={styles.filterGroupLabel}>{t('opportunities.tracker.filterStage')}</Text>
              <TrackerFilterChips
                selected={stageFilter}
                onSelect={setStageFilter}
                totalCount={queryFilteredItems.length}
                stageCounts={stageCounts}
              />
            </View>

            <View style={styles.sheetFooter}>
              <Button
                variant="secondary"
                style={styles.sheetFooterBtn}
                onPress={() => setStageFilter('all')}
              >
                {t('opportunities.tracker.clearFilters')}
              </Button>
              <Button style={styles.sheetFooterBtn} onPress={() => setFiltersOpen(false)}>
                {t('opportunities.tracker.applyFilters')}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
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
  intro: { paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: spacing.sm },
  headerRow: { gap: spacing.sm },
  headerRowDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  introTitle: { fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
  introBody: { fontSize: 14, lineHeight: 20, color: colors.textMuted },
  banner: { padding: spacing.md },

  searchRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  searchRowDesktop: { width: 380, flexGrow: 0, flexShrink: 0 },
  searchField: { flex: 1 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },

  sheetOverlay: { flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' },
  sheetOverlayDesktop: { justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  sheetHandle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
  },
  sheetDesktop: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    maxHeight: '85%',
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  sheetTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  filterGroup: { gap: spacing.xs, paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  filterGroupLabel: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 2 },
  sheetFooter: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
  sheetFooterBtn: { flex: 1 },

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
