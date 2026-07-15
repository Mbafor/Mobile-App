import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { SearchField, Text } from '@/components/ui';
import { EventCard } from '@/features/events/components/EventCard';
import { usePastEvents } from '@/features/events/hooks/usePastEvents';
import { useUpcomingEvents } from '@/features/events/hooks/useUpcomingEvents';
import { useEventRecentSearchesStore } from '@/features/events/store/recent-searches.store';
import type { ColorScheme } from '@/constants/theme/types';
import { spacing, typography } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Event } from '@/types/domain/event';

export function EventSearchScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();

  const upcoming = useUpcomingEvents();
  const past = usePastEvents(true);
  const { queries: recentSearches, addSearch, removeSearch, clearAll } = useEventRecentSearchesStore();

  const [query, setQuery] = useState('');

  const allEvents = useMemo(() => {
    const seen = new Set<string>();
    const combined: Event[] = [];
    for (const event of [...(upcoming.data ?? []), ...(past.data ?? [])]) {
      if (seen.has(event.id)) continue;
      seen.add(event.id);
      combined.push(event);
    }
    return combined;
  }, [upcoming.data, past.data]);

  const isSearchActive = query.trim().length > 0;

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return allEvents.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.category ?? '').toLowerCase().includes(q),
    );
  }, [allEvents, query]);

  const handleCancel = useCallback(() => {
    if (query.trim()) addSearch(query);
    router.back();
  }, [query, addSearch, router]);

  const handleSuggestionPress = useCallback((value: string) => setQuery(value), [setQuery]);

  const handleCardPress = useCallback(
    (event: Event) => {
      if (query.trim()) addSearch(query);
      router.push({ pathname: '/(main)/event/[id]', params: { id: event.id } });
    },
    [query, addSearch, router],
  );

  const isLoading = upcoming.isLoading || past.isLoading;
  const numColumns = isDesktop ? 3 : 1;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <View style={[styles.pageContent, isDesktop && styles.pageContentDesktop]}>
        <View style={styles.headerRow}>
          <SearchField
            value={query}
            onChangeText={setQuery}
            placeholder={t('events.search.placeholder')}
            style={styles.searchField}
            autoFocus
          />
          <Pressable onPress={handleCancel} hitSlop={8} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>{t('events.search.cancel')}</Text>
          </Pressable>
        </View>

        {isSearchActive ? (
          isLoading ? (
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
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <EventCard event={item} onPress={handleCardPress} style={styles.cardInGrid} />
              )}
            />
          )
        ) : recentSearches.length > 0 ? (
          <View style={styles.suggestions}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>{t('events.search.recentSearches')}</Text>
              <Pressable onPress={clearAll} hitSlop={8}>
                <Text style={styles.clearText}>{t('events.search.clearRecent')}</Text>
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
                  accessibilityLabel={t('events.search.clearRecent')}
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
    list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
    row: { justifyContent: 'flex-start', gap: spacing.md },
    cardInGrid: { width: undefined, flex: 1, marginRight: 0, marginBottom: spacing.md },
  });
}
