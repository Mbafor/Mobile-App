import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { Text } from '@/components/ui';
import { BROWSE_CATEGORY_LIST } from '@/constants/opportunity-fields';
import { colors, spacing, typography } from '@/constants/theme';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import { filterOpportunities } from '@/features/opportunities/utils/search-opportunities';
import { EMPTY_OPPORTUNITY_FILTERS } from '@/types/domain/opportunity';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

const PAGE_SIZE = 10;

const CARD_ACCENTS = [
  { bg: '#E8F5EE', text: '#1A3D25' },
  { bg: '#EAF0FB', text: '#1A2E5A' },
  { bg: '#FDF3E7', text: '#5A3A10' },
  { bg: '#F3EEF9', text: '#3A1A5A' },
  { bg: '#E8F5F0', text: '#1A3D2E' },
  { bg: '#FBF0EA', text: '#5A2A10' },
  { bg: '#EAF4FB', text: '#1A3A5A' },
  { bg: '#F9EEF3', text: '#5A1A3A' },
];

/** Vertical opportunity card for the search results grid. */
function OpportunityResultCard({
  opportunity,
  onPress,
}: {
  opportunity: Opportunity;
  onPress: (o: Opportunity) => void;
}) {
  const daysLeft = daysUntilDeadline(opportunity.deadline);
  const deadlineLabel =
    daysLeft <= 14
      ? `${formatDeadline(opportunity.deadline)} · ${daysLeft}d left`
      : formatDeadline(opportunity.deadline);

  return (
    <Pressable
      style={({ pressed }) => [styles.resultCard, pressed && { opacity: 0.85 }]}
      onPress={() => onPress(opportunity)}
      accessibilityRole="button"
    >
      {opportunity.imageUrl ? (
        <Image
          source={{ uri: opportunity.imageUrl }}
          style={styles.resultImage}
          resizeMode="cover"
        />
      ) : (
        <View style={[styles.resultImage, styles.resultImagePlaceholder]}>
          <Text style={styles.resultImageLetter}>{opportunity.organization.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.resultBody}>
        {opportunity.category ? (
          <View style={styles.resultCategoryBadge}>
            <Text style={styles.resultCategoryText}>{opportunity.category}</Text>
          </View>
        ) : null}
        <Text style={styles.resultTitle} numberOfLines={2}>
          {opportunity.title}
        </Text>
        <Text style={styles.resultOrg} numberOfLines={1}>
          {opportunity.organization}
        </Text>
        <Text style={styles.resultDeadline}>{deadlineLabel}</Text>
        {opportunity.tags.length > 0 ? (
          <View style={styles.resultTags}>
            {opportunity.tags.slice(0, 3).map((tag) => (
              <View key={tag} style={styles.resultTag}>
                <Text style={styles.resultTagText} numberOfLines={1}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export function BrowseCategoriesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const isDesktop = useWebDesktop();

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const { data: allOpportunities, isLoading } = useActiveOpportunities();

  const isSearchMode = query.trim().length > 0 || selectedCategory !== null;

  const filteredResults = useMemo(() => {
    if (!allOpportunities) return [];
    const filters = {
      ...EMPTY_OPPORTUNITY_FILTERS,
      categories: selectedCategory ? [selectedCategory] : [],
    };
    return filterOpportunities(allOpportunities, query, filters);
  }, [allOpportunities, query, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(filteredResults.length / PAGE_SIZE));
  const pagedResults = filteredResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCategoryToggle = (cat: string) => {
    setPage(1);
    setSelectedCategory((prev) => (prev === cat ? null : cat));
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setPage(1);
  };

  const handleCardPress = (opportunity: Opportunity) => {
    router.push({
      pathname: '/(main)/opportunity/[id]',
      params: { id: opportunity.id },
    });
  };

  return (
    <View style={styles.root}>
      <View style={[styles.fill, isDesktop && styles.fillDesktop]}>

        {/* ── Search bar ─────────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <View style={styles.searchField}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={handleQueryChange}
              placeholder="Search opportunities..."
              placeholderTextColor={colors.textMuted}
              returnKeyType="search"
              clearButtonMode="while-editing"
            />
            {query.length > 0 && Platform.OS !== 'ios' && (
              <Pressable onPress={() => handleQueryChange('')} hitSlop={8}>
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ── Category filter chips ───────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
          style={styles.chipsScroll}
        >
          {BROWSE_CATEGORY_LIST.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <Pressable
                key={cat}
                onPress={() => handleCategoryToggle(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{cat}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── Content area ────────────────────────────────────────── */}
        {isSearchMode ? (
          isLoading ? (
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View style={styles.resultsContainer}>
              {/* Result count + page info */}
              <View style={styles.resultsMeta}>
                <Text style={styles.resultsCount}>
                  {filteredResults.length}{' '}
                  {filteredResults.length === 1 ? 'result' : 'results'}
                  {selectedCategory ? ` in "${selectedCategory}"` : ''}
                </Text>
                {totalPages > 1 && (
                  <Text style={styles.pageInfo}>
                    Page {page} of {totalPages}
                  </Text>
                )}
              </View>

              {pagedResults.length === 0 ? (
                <EmptyState
                  title="No matches"
                  description="Try a different search or category."
                />
              ) : (
                <FlatList
                  data={pagedResults}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <OpportunityResultCard opportunity={item} onPress={handleCardPress} />
                  )}
                  numColumns={isDesktop ? 2 : 1}
                  key={isDesktop ? 'grid2' : 'grid1'}
                  columnWrapperStyle={isDesktop ? styles.gridRow : undefined}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={[
                    styles.resultsList,
                    { paddingBottom: insets.bottom + spacing.xl },
                  ]}
                  ListFooterComponent={
                    totalPages > 1 ? (
                      <View style={styles.pagination}>
                        <Pressable
                          onPress={() => setPage((p) => Math.max(1, p - 1))}
                          disabled={page === 1}
                          style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
                        >
                          <Ionicons
                            name="chevron-back"
                            size={16}
                            color={page === 1 ? colors.textMuted : colors.primary}
                          />
                          <Text
                            style={[
                              styles.pageBtnText,
                              page === 1 && styles.pageBtnTextDisabled,
                            ]}
                          >
                            Previous
                          </Text>
                        </Pressable>

                        <Text style={styles.pageNumbers}>
                          {page} / {totalPages}
                        </Text>

                        <Pressable
                          onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                          disabled={page === totalPages}
                          style={[
                            styles.pageBtn,
                            page === totalPages && styles.pageBtnDisabled,
                          ]}
                        >
                          <Text
                            style={[
                              styles.pageBtnText,
                              page === totalPages && styles.pageBtnTextDisabled,
                            ]}
                          >
                            Next
                          </Text>
                          <Ionicons
                            name="chevron-forward"
                            size={16}
                            color={page === totalPages ? colors.textMuted : colors.primary}
                          />
                        </Pressable>
                      </View>
                    ) : null
                  }
                />
              )}
            </View>
          )
        ) : (
          /* Default: category discovery grid */
          <ScrollView
            contentContainerStyle={[
              styles.grid,
              { paddingBottom: insets.bottom + spacing.xl },
            ]}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.discoverLabel}>Find opportunities by focus area</Text>
            {BROWSE_CATEGORY_LIST.map((category, i) => {
              const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
              return (
                <Pressable
                  key={category}
                  style={({ pressed }) => [
                    styles.card,
                    { backgroundColor: accent.bg, opacity: pressed ? 0.85 : 1 },
                  ]}
                  onPress={() => handleCategoryToggle(category)}
                >
                  <View style={[styles.dot, { backgroundColor: accent.text + '22' }]} />
                  <Text style={[styles.cardText, { color: accent.text }]}>{category}</Text>
                  <Ionicons
                    name="arrow-forward"
                    size={14}
                    color={accent.text}
                    style={styles.cardArrow}
                  />
                </Pressable>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  fill: {
    flex: 1,
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
  },
  fillDesktop: {
    paddingHorizontal: spacing.lg,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // ── Search bar ────────────────────────────────────────────────────────────
  searchWrap: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  searchField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    height: 44,
    gap: spacing.xs,
  },
  searchIcon: { marginRight: 2 },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 0,
    ...Platform.select({ web: { outlineStyle: 'none' } as any }),
  },

  // ── Category chips ────────────────────────────────────────────────────────
  chipsScroll: { maxHeight: 44, marginBottom: spacing.sm },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.text },
  chipTextActive: { color: colors.background },

  // ── Results ───────────────────────────────────────────────────────────────
  resultsContainer: { flex: 1 },
  resultsMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  resultsCount: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 13,
    color: colors.textMuted,
  },
  resultsList: { gap: spacing.sm },
  gridRow: { gap: spacing.sm },

  resultCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  resultImage: { width: '100%', height: 140 },
  resultImagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultImageLetter: {
    fontSize: 40,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  resultBody: {
    padding: spacing.md,
    gap: spacing.xs,
  },
  resultCategoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: `${colors.primary}12`,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 999,
    marginBottom: 2,
  },
  resultCategoryText: { fontSize: 11, color: colors.primary, fontWeight: '600' },
  resultTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  resultOrg: { fontSize: 13, color: colors.textMuted },
  resultDeadline: { fontSize: 13, color: colors.primary, fontWeight: '500' },
  resultTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 2 },
  resultTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 110,
  },
  resultTagText: { fontSize: 11, color: colors.textMuted },

  // ── Pagination ────────────────────────────────────────────────────────────
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    marginTop: spacing.sm,
  },
  pageBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
    backgroundColor: `${colors.primary}0D`,
  },
  pageBtnDisabled: {
    backgroundColor: colors.surface,
  },
  pageBtnText: { fontSize: 14, fontWeight: '600', color: colors.primary },
  pageBtnTextDisabled: { color: colors.textMuted },
  pageNumbers: { fontSize: 14, color: colors.textMuted, fontWeight: '500' },

  // ── Discovery grid ────────────────────────────────────────────────────────
  discoverLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingTop: spacing.xs,
  },
  card: {
    width: '47%',
    minHeight: 96,
    padding: spacing.md,
    borderRadius: 16,
    justifyContent: 'space-between',
  },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 8,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    flex: 1,
  },
  cardArrow: {
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
});
