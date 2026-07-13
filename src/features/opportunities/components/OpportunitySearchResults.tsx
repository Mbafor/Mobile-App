import { useTranslation } from 'react-i18next';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { EmptyState, ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { OpportunityListRow } from '@/features/opportunities/components/OpportunityListRow';
import { spacing } from '@/constants/theme';
import type { Opportunity } from '@/types/domain/opportunity';

type OpportunitySearchResultsProps = {
  results: Opportunity[];
  resultCount: number;
  isLoading: boolean;
  isRefetching: boolean;
  error: unknown;
  onRefetch: () => void;
  onPressOpportunity: (opportunity: Opportunity) => void;
};

export function OpportunitySearchResults({
  results,
  resultCount,
  isLoading,
  isRefetching,
  error,
  onRefetch,
  onPressOpportunity,
}: OpportunitySearchResultsProps) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();

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
          <ErrorMessage message={error instanceof Error ? error.message : t('opportunities.search.failed')} />
        </View>
      ) : null}
      <ScrollView
        style={styles.list}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={onRefetch}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={results.length === 0 ? styles.emptyList : undefined}
      >
        <Text variant="caption" muted style={styles.resultMeta}>
          {t('opportunities.search.resultCount', { count: resultCount })}
        </Text>

        {results.length === 0 ? (
          <EmptyState
            title={t('opportunities.search.emptyTitle')}
            description={t('opportunities.search.emptyDescription')}
          />
        ) : (
          results.map((item) => (
            <OpportunityListRow key={item.id} opportunity={item} onPress={onPressOpportunity} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { flex: 1 },
  banner: { paddingHorizontal: spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultMeta: { paddingHorizontal: spacing.md, paddingTop: 0, paddingBottom: spacing.xs },
  emptyList: { flexGrow: 1 },
});
}
