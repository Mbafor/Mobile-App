import React, { useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, StyleSheet, View } from 'react-native';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { Text } from '@/components/ui';
import { ErrorMessage } from '@/components/feedback';
import { OpportunitySection } from '@/features/opportunities/components/OpportunitySection';
import { useTrackerOpportunities } from '@/features/opportunities/hooks/useTrackerOpportunities';
import { filterTrackerItems } from '@/features/opportunities/utils/filter-tracker';
import { EMPTY_TRACKER_FILTERS, type TrackerStage, type TrackerFilters } from '@/types/domain/tracker';
import { spacing } from '@/constants/theme';

export default function SavedScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [query, setQuery] = useState('');

  const { items, isLoading, isRefetching, error, refetch } = useTrackerOpportunities();

  const savedItems = useMemo(() => {
    const filters: TrackerFilters = { ...EMPTY_TRACKER_FILTERS, stages: ['saved' as TrackerStage] };
    return filterTrackerItems(items, query, filters).map((i) => i.opportunity);
  }, [items, query]);

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
            message={error instanceof Error ? error.message : 'Failed to load saved items'}
          />
        </View>
      ) : null}

      <Text variant="title" style={styles.title}>Saved</Text>

      <OpportunitySection
        title="Saved opportunities"
        opportunities={savedItems}
        onCardPress={() => {}}
      />
    </View>
  );
}

function createStyles(colors: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingBottom: spacing.md },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    banner: { padding: spacing.md },
    title: { paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.xs },
  });
}
