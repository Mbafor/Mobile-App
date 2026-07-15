import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { EmptyState } from '@/components/feedback';
import { FilterDropdown, SearchField, Text } from '@/components/ui';
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
  const cardStyle = numColumns > 1 ? styles.cardInGrid : styles.cardFullWidth;

  return (
    <View style={styles.container}>
      <View style={styles.pageContent}>
        <View style={styles.intro}>
          <Text style={styles.introTitle}>{t('events.intro.title')}</Text>
          <Text style={styles.introBody}>{t('events.intro.body')}</Text>
        </View>

        {searchOpen ? (
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('events.search.placeholder')}
            style={[styles.searchField, isDesktop && styles.searchFieldDesktop]}
            autoFocus
          />
        ) : null}

        <View style={styles.filterRow}>
          <View style={styles.timingToggle}>
            <Pressable
              style={[styles.timingOption, timing === 'upcoming' && styles.timingOptionActive]}
              onPress={() => setTiming('upcoming')}
            >
              <Text style={[styles.timingOptionText, timing === 'upcoming' && styles.timingOptionTextActive]}>
                {t('events.timing.upcoming')}
              </Text>
            </Pressable>
            <Pressable
              style={[styles.timingOption, timing === 'past' && styles.timingOptionActive]}
              onPress={() => setTiming('past')}
            >
              <Text style={[styles.timingOptionText, timing === 'past' && styles.timingOptionTextActive]}>
                {t('events.timing.past')}
              </Text>
            </Pressable>
          </View>

          <FilterDropdown options={categoryOptions} selected={category} onSelect={setCategory} style={styles.filterDropdown} />
        </View>

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
              <EventCard event={item} onPress={handleCardPress} style={cardStyle} />
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
    intro: { marginBottom: spacing.md, gap: 4 },
    introTitle: { fontSize: 22, fontWeight: '700', color: colors.text, letterSpacing: -0.3 },
    introBody: { fontSize: 14, lineHeight: 20, color: colors.textMuted },
    searchField: { marginBottom: spacing.sm },
    searchFieldDesktop: { maxWidth: 360 },
    filterRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingBottom: spacing.md,
    },
    timingToggle: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    timingOption: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.background,
    },
    timingOptionActive: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    timingOptionText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    timingOptionTextActive: { color: colors.primary },
    filterDropdown: { flexGrow: 1, flexBasis: 160, maxWidth: 220 },
    spinner: { marginTop: spacing.xl },
    list: { paddingBottom: spacing.xl },
    row: { justifyContent: 'flex-start', gap: spacing.md },
    cardInGrid: { flex: 1, marginBottom: spacing.md },
    cardFullWidth: { width: '100%', marginBottom: spacing.md },
  });
}
