import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { SearchField, Text } from '@/components/ui';
import { OpportunityListRow } from '@/features/opportunities/components/OpportunityListRow';
import { useTrackerOpportunities } from '@/features/opportunities/hooks/useTrackerOpportunities';
import { useTrackerRecentSearchesStore } from '@/features/opportunities/store/recent-searches.store';
import { filterTrackerItems } from '@/features/opportunities/utils/filter-tracker';
import { EMPTY_TRACKER_FILTERS } from '@/types/domain/tracker';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Opportunity } from '@/types/domain/opportunity';

export function TrackerSearchScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();

  const [query, setQuery] = useState('');
  const { items, isLoading } = useTrackerOpportunities();
  const { queries: recentSearches, addSearch, removeSearch, clearAll } = useTrackerRecentSearchesStore();

  const isSearchActive = query.trim().length > 0;

  const results = useMemo(
    () => filterTrackerItems(items, query, EMPTY_TRACKER_FILTERS).map((item) => item.opportunity),
    [items, query],
  );

  const handleCancel = useCallback(() => {
    if (query.trim()) addSearch(query);
    router.back();
  }, [query, addSearch, router]);

  const handleSuggestionPress = useCallback((value: string) => setQuery(value), []);

  const handleCardPress = useCallback(
    (opportunity: Opportunity) => {
      if (query.trim()) addSearch(query);
      router.push({ pathname: '/(main)/opportunity/[id]', params: { id: opportunity.id } });
    },
    [query, addSearch, router],
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <View style={[styles.pageContent, isDesktop && styles.pageContentDesktop]}>
        <View style={styles.headerRow}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('opportunities.tracker.searchPlaceholder')}
            style={styles.searchField}
            autoFocus
          />
          <Pressable onPress={handleCancel} hitSlop={8} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{t('opportunities.tracker.searchCancel')}</Text>
          </Pressable>
        </View>

        {isSearchActive ? (
          isLoading ? (
            <ActivityIndicator style={styles.spinner} color={colors.primary} />
          ) : results.length === 0 ? (
            <EmptyState
              title={t('opportunities.tracker.searchEmptyTitle')}
              description={t('opportunities.tracker.searchEmptyDescription')}
            />
          ) : (
            <ScrollView keyboardShouldPersistTaps="handled">
              {results.map((opportunity) => (
                <OpportunityListRow key={opportunity.id} opportunity={opportunity} onPress={handleCardPress} />
              ))}
            </ScrollView>
          )
        ) : recentSearches.length > 0 ? (
          <View style={styles.suggestions}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('opportunities.tracker.searchRecentSearches')}</Text>
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text style={styles.clearText}>{t('opportunities.tracker.searchClearRecent')}</Text>
              </Pressable>
            </View>
            {recentSearches.map((item) => (
              <Pressable key={item} style={styles.suggestionRow} onPress={() => handleSuggestionPress(item)}>
                <Ionicons name="time-outline" size={18} color={colors.textMuted} style={styles.suggestionIcon} />
                <Text style={styles.suggestionText} numberOfLines={1}>
                  {item}
                </Text>
                <Pressable
                  onPress={() => removeSearch(item)}
                  hitSlop={8}
                  accessibilityLabel={t('opportunities.tracker.searchClearRecent')}
                >
                  <Ionicons name="close" size={16} color={colors.textMuted} />
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : null}
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pageContent: { flex: 1, width: '100%', maxWidth: 1200, alignSelf: 'center' },
    pageContentDesktop: { paddingHorizontal: spacing.md },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.sm,
      gap: spacing.sm,
    },
    searchField: { flex: 1 },
    cancelBtn: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
    cancelText: { fontSize: typography.fontSize.md, color: colors.primary, fontWeight: '600' },
    suggestions: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    clearText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm + 2,
    },
    suggestionIcon: { width: 18 },
    suggestionText: { flex: 1, fontSize: typography.fontSize.md, color: colors.text },
    spinner: { marginTop: spacing.xl },
  });
}
