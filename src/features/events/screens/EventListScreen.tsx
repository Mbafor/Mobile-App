import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { FilterChips, SearchField } from '@/components/ui';
import { EventCard } from '@/features/events/components/EventCard';
import { usePastEvents } from '@/features/events/hooks/usePastEvents';
import { useUpcomingEvents } from '@/features/events/hooks/useUpcomingEvents';
import { getEventCategoryOptions } from '@/constants/event-fields';
import { useInlineSearchToggle } from '@/features/menu/store/inline-search-toggle.store';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Event, EventTimingFilter } from '@/types/domain/event';

const ALL_CATEGORIES = 'all';

export function EventListScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktop = useWebDesktop();

  const searchOpen = useInlineSearchToggle((s) => s.open);
  const setSearchOpen = useInlineSearchToggle((s) => s.setOpen);
  const [query, setQuery] = useState('');

  useFocusEffect(
    useCallback(() => {
      setSearchOpen(false);
    }, [setSearchOpen]),
  );

  const [timing, setTiming] = useState<EventTimingFilter>('upcoming');
  const [category, setCategory] = useState<string>(ALL_CATEGORIES);

  const upcoming = useUpcomingEvents();
  const past = usePastEvents(timing === 'past');
  const activeQuery = timing === 'upcoming' ? upcoming : past;
  const allResults = activeQuery.data ?? [];
  const byCategory =
    category === ALL_CATEGORIES ? allResults : allResults.filter((event) => event.category === category);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.category ?? '').toLowerCase().includes(q),
    );
  }, [byCategory, query]);

  const timingOptions = useMemo(
    () => [
      { value: 'upcoming' as const, label: t('events.timing.upcoming') },
      { value: 'past' as const, label: t('events.timing.past') },
    ],
    [t],
  );

  const categoryOptions = useMemo(
    () => [
      { value: ALL_CATEGORIES, label: t('events.filters.allCategories'), count: allResults.length },
      ...getEventCategoryOptions().map((opt) => ({
        value: opt.value,
        label: opt.label,
        count: allResults.filter((event) => event.category === opt.value).length,
      })),
    ],
    [t, allResults],
  );

  const handleCardPress = useCallback(
    (event: Event) => {
      router.push({ pathname: '/(main)/event/[id]', params: { id: event.id } });
    },
    [router],
  );

  const numColumns = isDesktop ? 4 : 1;

  return (
    <View style={styles.container}>
      <View style={styles.pageContent}>
        {searchOpen ? (
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('events.search.placeholder')}
            style={[styles.searchField, isDesktop && styles.searchFieldDesktop]}
            autoFocus
          />
        ) : null}

        <FilterChips options={timingOptions} selected={timing} onSelect={setTiming} style={styles.filterRow} />
        <FilterChips options={categoryOptions} selected={category} onSelect={setCategory} style={styles.filterRow} />

        {activeQuery.isLoading ? (
          <ActivityIndicator style={styles.spinner} color={colors.primary} />
        ) : results.length === 0 ? (
          <EmptyState
            title={t('events.search.emptyTitle')}
            description={t('events.search.emptyDescription')}
          />
        ) : (
          <FlatList
            key={numColumns}
            data={results}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <EventCard event={item} onPress={handleCardPress} style={styles.cardInGrid} />
            )}
          />
        )}
      </View>
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    pageContent: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.md },
    searchField: { marginBottom: spacing.sm },
    searchFieldDesktop: { maxWidth: 360 },
    filterRow: { paddingBottom: spacing.xs },
    spinner: { marginTop: spacing.xl },
    list: { paddingBottom: spacing.xl },
    row: { justifyContent: 'flex-start', gap: spacing.md },
    cardInGrid: { width: undefined, flex: 1, marginRight: 0, marginBottom: spacing.md },
  });
}
