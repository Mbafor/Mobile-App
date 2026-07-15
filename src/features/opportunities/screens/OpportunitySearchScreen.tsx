import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SearchField, Text } from '@/components/ui';
import { OpportunityQuickFilters } from '@/features/opportunities/components/OpportunityQuickFilters';
import { OpportunitySearchResults } from '@/features/opportunities/components/OpportunitySearchResults';
import { useOpportunitySearch } from '@/features/opportunities/hooks/useOpportunitySearch';
import { useRecentSearchesStore } from '@/features/opportunities/store/recent-searches.store';
import { QUICK_SEARCH_CATEGORIES, TRENDING_SEARCHES } from '@/constants/search-suggestions';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Opportunity } from '@/types/domain/opportunity';

export function OpportunitySearchScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();

  const {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    resultCount,
    activeFilterCount,
    isLoading,
    isRefetching,
    error,
    refetch,
  } = useOpportunitySearch();

  const { queries: recentSearches, addSearch, removeSearch, clearAll } = useRecentSearchesStore();

  const isSearchActive = query.trim().length > 0 || activeFilterCount > 0;

  const handleCancel = useCallback(() => {
    if (query.trim()) addSearch(query);
    router.back();
  }, [query, addSearch, router]);

  const handleSuggestionPress = useCallback(
    (value: string) => setQuery(value),
    [setQuery],
  );

  const handleCardPress = useCallback(
    (opportunity: Opportunity) => {
      if (query.trim()) addSearch(query);
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: opportunity.id },
      });
    },
    [query, addSearch, router],
  );

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <View style={[styles.pageContent, isDesktop && styles.pageContentDesktop]}>
      <View style={[styles.headerRow, isDesktop && styles.headerRowDesktop]}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('opportunities.search.placeholder')}
          style={styles.searchField}
          autoFocus
        />
        <Pressable onPress={handleCancel} hitSlop={8} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>{t('opportunities.search.cancel')}</Text>
        </Pressable>
      </View>

      {isSearchActive ? (
        <>
          <OpportunityQuickFilters filters={filters} onChange={setFilters} />
          <OpportunitySearchResults
            results={results}
            resultCount={resultCount}
            isLoading={isLoading}
            isRefetching={isRefetching}
            error={error}
            onRefetch={refetch}
            onPressOpportunity={handleCardPress}
          />
        </>
      ) : (
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.suggestions}>
          {recentSearches.length > 0 ? (
            <>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>{t('opportunities.search.recentSearches')}</Text>
                <Pressable onPress={clearAll} hitSlop={8}>
                  <Text style={styles.clearText}>{t('opportunities.search.clearRecent')}</Text>
                </Pressable>
              </View>
              {recentSearches.map((item) => (
                <Pressable
                  key={item}
                  style={styles.suggestionRow}
                  onPress={() => handleSuggestionPress(item)}
                >
                  <Ionicons
                    name="time-outline"
                    size={18}
                    color={colors.textMuted}
                    style={styles.suggestionIcon}
                  />
                  <Text style={styles.suggestionText} numberOfLines={1}>
                    {item}
                  </Text>
                  <Pressable
                    onPress={() => removeSearch(item)}
                    hitSlop={8}
                    accessibilityLabel={t('opportunities.search.clearRecent')}
                  >
                    <Ionicons name="close" size={16} color={colors.textMuted} />
                  </Pressable>
                </Pressable>
              ))}

              <View style={styles.divider} />
            </>
          ) : null}

          <Text style={styles.sectionTitle}>{t('opportunities.search.trendingSearches')}</Text>
          {TRENDING_SEARCHES.map((item) => (
            <Pressable
              key={item}
              style={styles.suggestionRow}
              onPress={() => handleSuggestionPress(item)}
            >
              <Ionicons
                name="trending-up-outline"
                size={18}
                color={colors.textMuted}
                style={styles.suggestionIcon}
              />
              <Text style={styles.suggestionText} numberOfLines={1}>
                {item}
              </Text>
            </Pressable>
          ))}

          <Text style={[styles.sectionTitle, styles.lookingForTitle]}>
            {t('opportunities.search.lookingFor')}
          </Text>
          <View style={styles.chipRow}>
            {QUICK_SEARCH_CATEGORIES.map((item) => (
              <Pressable
                key={item}
                style={styles.chip}
                onPress={() => handleSuggestionPress(item)}
              >
                <Text style={styles.chipText}>{item}</Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>
      )}
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
    headerRowDesktop: {
      maxWidth: 560,
      width: '100%',
    },
    searchField: { flex: 1 },
    cancelBtn: { paddingHorizontal: spacing.xs, paddingVertical: spacing.xs },
    cancelText: { fontSize: typography.fontSize.md, color: colors.primary, fontWeight: '600' },
    suggestions: { paddingHorizontal: spacing.md, paddingBottom: spacing.lg },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    sectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    lookingForTitle: { marginTop: spacing.lg },
    clearText: { fontSize: 13, fontWeight: '600', color: colors.primary },
    suggestionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      paddingVertical: spacing.sm + 2,
    },
    suggestionIcon: { width: 18 },
    suggestionText: { flex: 1, fontSize: typography.fontSize.md, color: colors.text },
    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: spacing.sm,
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    chip: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipText: { fontSize: typography.fontSize.sm, color: colors.text, fontWeight: '600' },
  });
}
