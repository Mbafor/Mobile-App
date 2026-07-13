import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/components/feedback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Text } from '@/components/ui';
import { slugToCategory } from '@/constants/browse-categories';
import { spacing, typography } from '@/constants/theme';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

const PAGE_SIZE = 10;

function matchesCategory(opportunity: Opportunity, category: string): boolean {
  const normalized = category.trim().toLowerCase();
  if (opportunity.category?.trim().toLowerCase() === normalized) return true;
  return opportunity.tags.some((tag) => tag.trim().toLowerCase() === normalized);
}

/** Vertical card for category results — same visual style as BrowseCategoriesScreen. */
function OpportunityResultCard({
  opportunity,
  onPress,
}: {
  opportunity: Opportunity;
  onPress: (o: Opportunity) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const { t } = useTranslation();
  const daysLeft = daysUntilDeadline(opportunity.deadline);
  const deadlineLabel =
    daysLeft <= 14
      ? `${formatDeadline(opportunity.deadline)} · ${t('opportunities.common.daysLeft', { days: daysLeft })}`
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
          contentFit="cover"
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

export function CategoryOpportunitiesScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const isDesktop = useWebDesktop();
  const { category: categorySlug } = useLocalSearchParams<{ category: string }>();
  const categoryName = slugToCategory(
    typeof categorySlug === 'string' ? categorySlug : categorySlug?.[0] ?? '',
  );

  const [page, setPage] = useState(1);

  const { data, isLoading, isRefetching, refetch } = useActiveOpportunities();

  const results = useMemo(
    () => (data ?? []).filter((o) => matchesCategory(o, categoryName)),
    [categoryName, data],
  );

  const totalPages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const pagedResults = results.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handlePress = useCallback(
    (opportunity: Opportunity) => {
      router.push({
        pathname: '/(main)/opportunity/[id]',
        params: { id: opportunity.id },
      });
    },
    [router],
  );

  if (isLoading) {
    return (
      <View style={styles.root}>
        <PageHeader title={categoryName} />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <PageHeader title={categoryName} />

      <FlatList
        data={pagedResults}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OpportunityResultCard opportunity={item} onPress={handlePress} />
        )}
        numColumns={isDesktop ? 2 : 1}
        key={isDesktop ? 'grid2' : 'grid1'}
        columnWrapperStyle={isDesktop ? styles.gridRow : undefined}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => void refetch()}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <View style={styles.metaRow}>
            <Text variant="caption" muted style={styles.meta}>
              {t('menu.category.count', { count: results.length })}
            </Text>
            {totalPages > 1 && (
              <Text variant="caption" muted>
                {t('menu.category.pageOf', { page, total: totalPages })}
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            title={t('menu.category.empty.title')}
            description={t('menu.category.empty.description', { category: categoryName })}
          />
        }
        contentContainerStyle={[
          styles.list,
          results.length === 0 && styles.empty,
        ]}
        style={styles.scroll}
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
                  style={[styles.pageBtnText, page === 1 && styles.pageBtnTextDisabled]}
                >
                  {t('menu.pagination.previous')}
                </Text>
              </Pressable>

              <Text style={styles.pageNumbers}>
                {page} / {totalPages}
              </Text>

              <Pressable
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={[styles.pageBtn, page === totalPages && styles.pageBtnDisabled]}
              >
                <Text
                  style={[
                    styles.pageBtnText,
                    page === totalPages && styles.pageBtnTextDisabled,
                  ]}
                >
                  {t('menu.pagination.next')}
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
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  list: {
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  gridRow: { gap: spacing.sm },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: spacing.sm,
  },
  meta: {
    color: colors.textMuted,
  },
  empty: { flexGrow: 1 },

  // ── Vertical result card ──────────────────────────────────────────────────
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
    color: `${colors.textOnPrimary}E6`,
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
  resultDeadline: { fontSize: 13, color: colors.text, fontWeight: '500' },
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
    marginHorizontal: spacing.md,
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
});
}
