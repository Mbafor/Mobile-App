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
import type { ColorScheme } from '@/constants/theme/types';
import { spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import type { Event, EventTimingFilter } from '@/types/domain/event';

export function EventListScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();

  const [timing, setTiming] = useState<EventTimingFilter>('upcoming');
  const [query, setQuery] = useState('');

  const upcoming = useUpcomingEvents();
  const past = usePastEvents(timing === 'past');
  const activeQuery = timing === 'upcoming' ? upcoming : past;

  const results = useMemo(() => {
    const all = activeQuery.data ?? [];
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (event) =>
        event.title.toLowerCase().includes(q) ||
        (event.category ?? '').toLowerCase().includes(q),
    );
  }, [activeQuery.data, query]);

  const handleCardPress = useCallback(
    (event: Event) => {
      router.push({ pathname: '/(main)/event/[id]', params: { id: event.id } });
    },
    [router],
  );

  const numColumns = isDesktop ? 3 : 1;

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, spacing.md) }]}>
      <View style={[styles.pageContent, isDesktop && styles.pageContentDesktop]}>
        <SearchField
          value={query}
          onChangeText={setQuery}
          placeholder={t('events.search.placeholder')}
          style={styles.searchField}
        />

        <View style={styles.timingRow}>
          <Pressable
            style={[styles.timingBtn, timing === 'upcoming' && styles.timingBtnActive]}
            onPress={() => setTiming('upcoming')}
          >
            <Text style={[styles.timingText, timing === 'upcoming' && styles.timingTextActive]}>
              {t('events.timing.upcoming')}
            </Text>
          </Pressable>
          <Pressable
            style={[styles.timingBtn, timing === 'past' && styles.timingBtnActive]}
            onPress={() => setTiming('past')}
          >
            <Text style={[styles.timingText, timing === 'past' && styles.timingTextActive]}>
              {t('events.timing.past')}
            </Text>
          </Pressable>
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
    pageContent: { flex: 1, paddingHorizontal: spacing.lg },
    pageContentDesktop: { maxWidth: 1100, width: '100%', alignSelf: 'center' },
    searchField: { marginBottom: spacing.sm },
    timingRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    timingBtn: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs + 2,
      borderRadius: 999,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    timingBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timingText: { fontSize: 13, fontWeight: '600', color: colors.textMuted },
    timingTextActive: { color: colors.background },
    spinner: { marginTop: spacing.xl },
    list: { paddingBottom: spacing.xl },
    row: { justifyContent: 'flex-start', gap: spacing.md },
    cardInGrid: { width: undefined, flex: 1, marginRight: 0, marginBottom: spacing.md },
  });
}
