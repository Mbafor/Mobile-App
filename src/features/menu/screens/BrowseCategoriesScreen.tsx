import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { EmptyState } from '@/components/feedback';
import { Text } from '@/components/ui';
import { BROWSE_CATEGORY_LIST } from '@/constants/opportunity-fields';
import { categoryToSlug } from '@/constants/browse-categories';
import { colors, spacing, typography } from '@/constants/theme';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
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

/** Vertical opportunity card for the results grid. */
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

  const [page, setPage] = useState(1);

  const { data: allOpportunities, isLoading } = useActiveOpportunities();

  const totalPages = useMemo(() => {
    if (!allOpportunities) return 1;
    return Math.max(1, Math.ceil(allOpportunities.length / PAGE_SIZE));
  }, [allOpportunities]);

  const pagedResults = useMemo(() => {
    if (!allOpportunities) return [];
    return allOpportunities.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  }, [allOpportunities, page]);

  const handleCardPress = (opportunity: Opportunity) => {
    router.push({
      pathname: '/(main)/opportunity/[id]',
      params: { id: opportunity.id },
    });
  };

  const handleCategoryPress = (category: string) => {
    router.push({
      pathname: '/(main)/category/[category]',
      params: { category: categoryToSlug(category) },
    });
  };

  const renderHeader = () => {
    return (
      <View style={styles.headerContainer}>
        <Text style={styles.discoverLabel}>Find opportunities by focus area</Text>
        <View style={styles.grid}>
          {BROWSE_CATEGORY_LIST.map((category, i) => {
            const accent = CARD_ACCENTS[i % CARD_ACCENTS.length];
            return (
              <Pressable
                key={category}
                style={({ pressed }) => [
                  styles.card,
                  { backgroundColor: accent.bg, opacity: pressed ? 0.85 : 1 },
                ]}
                onPress={() => handleCategoryPress(category)}
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
        </View>
        <Text style={styles.sectionHeading}>All active opportunities</Text>
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <View style={[styles.fill, isDesktop && styles.fillDesktop]}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <View style={styles.resultsContainer}>
            <FlatList
              data={pagedResults}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <OpportunityResultCard opportunity={item} onPress={handleCardPress} />
              )}
              ListHeaderComponent={renderHeader}
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
          </View>
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingTop: spacing.md,
  },
  resultsList: {
    gap: spacing.sm,
  },
  gridRow: {
    gap: spacing.sm,
  },
  resultCard: {
    flex: 1,
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: spacing.sm,
  },
  resultImage: {
    width: '100%',
    height: 140,
  },
  resultImagePlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    height: 140,
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
  resultCategoryText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  resultTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 22,
  },
  resultOrg: {
    fontSize: 13,
    color: colors.textMuted,
  },
  resultDeadline: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '500',
  },
  resultTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 2,
  },
  resultTag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: 10,
    maxWidth: 110,
  },
  resultTagText: {
    fontSize: 11,
    color: colors.textMuted,
  },
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
  pageBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  pageBtnTextDisabled: {
    color: colors.textMuted,
  },
  pageNumbers: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },

  // Header Categories Styles
  headerContainer: {
    marginBottom: spacing.lg,
  },
  discoverLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
});
