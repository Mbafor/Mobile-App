import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Text } from '@/components/ui';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import { useOpportunityDetail } from '@/features/opportunities/hooks/useOpportunityDetail';
import { useOpportunityEngagement } from '@/features/opportunities/hooks/useOpportunityEngagement';
import { buildOpportunityWebLink } from '@/features/opportunities/utils/opportunity-share-link';
import { buildShareMessage } from '@/features/opportunities/utils/share-opportunity';
import { spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { useWebDesktop } from '@/hooks/useWebDesktop';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

function DeadlineBadge({ deadline }: { deadline: string }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const days = daysUntilDeadline(deadline);
  const label = formatDeadline(deadline);
  const urgent = days >= 0 && days <= 7;
  const expired = days < 0;

  const bg = expired ? `${colors.error}12` : urgent ? '#FFF4E5' : `${colors.primary}0D`;
  const textColor = expired ? colors.error : urgent ? '#B45309' : colors.primary;
  const iconName: keyof typeof Ionicons.glyphMap = expired
    ? 'time-outline'
    : urgent
    ? 'alert-circle-outline'
    : 'calendar-outline';

  return (
    <View style={[styles.deadlineBadge, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={13} color={textColor} />
      <Text style={[styles.deadlineText, { color: textColor }]}>
        {expired ? 'Deadline passed' : `${label}${days > 0 ? ` · ${days}d left` : ''}`}
      </Text>
    </View>
  );
}

/** Compact card used in the related opportunities sidebar. */
function RelatedOpportunityCard({
  opportunity,
  onPress,
}: {
  opportunity: Opportunity;
  onPress: (o: Opportunity) => void;
}) {
  const styles = useThemedStyles(createStyles);
  const daysLeft = daysUntilDeadline(opportunity.deadline);
  return (
    <Pressable
      style={({ pressed }) => [styles.relatedCard, pressed && { opacity: 0.8 }]}
      onPress={() => onPress(opportunity)}
      accessibilityRole="button"
    >
      {opportunity.imageUrl ? (
        <Image source={{ uri: opportunity.imageUrl }} style={styles.relatedThumb} resizeMode="cover" />
      ) : (
        <View style={[styles.relatedThumb, styles.relatedThumbPlaceholder]}>
          <Text style={styles.relatedThumbLetter}>{opportunity.organization.charAt(0)}</Text>
        </View>
      )}
      <View style={styles.relatedBody}>
        <Text style={styles.relatedTitle} numberOfLines={2}>{opportunity.title}</Text>
        <Text style={styles.relatedOrg} numberOfLines={1}>{opportunity.organization}</Text>
        <Text style={styles.relatedDeadline}>
          {formatDeadline(opportunity.deadline)}
          {daysLeft > 0 ? ` · ${daysLeft}d left` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export function OpportunityDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const isDesktop = useWebDesktop();
  const { id } = useLocalSearchParams<{ id: string }>();
  const opportunityId = typeof id === 'string' ? id : id?.[0];

  const { data: opportunity, isLoading, error } = useOpportunityDetail(opportunityId);
  const {
    isSaved,
    isApplied,
    isSaving,
    isApplying,
    toggleSave,
    toggleApplied,
    applyNow,
  } = useOpportunityEngagement(opportunityId);

  const { data: allOpportunities } = useActiveOpportunities();

  const relatedOpportunities = useMemo(() => {
    if (!opportunity || !allOpportunities) return [];
    return allOpportunities
      .filter(
        (o) =>
          o.id !== opportunity.id &&
          o.category &&
          o.category === opportunity.category,
      )
      .slice(0, 5);
  }, [opportunity, allOpportunities]);

  const handleRelatedPress = (o: Opportunity) => {
    router.push({
      pathname: '/(main)/opportunity/[id]',
      params: { id: o.id },
    });
  };

  const opportunityLink = useMemo(() => {
    if (!opportunity) return '';
    return buildOpportunityWebLink(opportunity.id);
  }, [opportunity]);

  const shareSection = useMemo(() => {
    if (!opportunity) return null;
    return (
      <View style={styles.shareSectionInner}>
        <Text style={styles.shareLabel}>Share opportunity via</Text>
        <View style={styles.shareIconsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EAF8F2' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              const text = buildShareMessage(opportunity, opportunityLink);
              Linking.openURL(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Share on WhatsApp"
          >
            <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EAF3FC' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              Linking.openURL(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunityLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Share on LinkedIn"
          >
            <Ionicons name="logo-linkedin" size={20} color="#0A66C2" />
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EBF2FC' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              Linking.openURL(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunityLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel="Share on Facebook"
          >
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          </Pressable>
        </View>
      </View>
    );
  }, [opportunity, opportunityLink]);

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <View style={styles.root}>
        <PageHeader title="Opportunity Details" />
        <View style={styles.errorBody}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Opportunity not found or has expired.'}
          />
          <Button variant="secondary" onPress={() => router.back()}>
            Go back
          </Button>
        </View>
      </View>
    );
  }

  const orgInitial = opportunity.organization.charAt(0).toUpperCase();

  const metaParts: string[] = [
    ...(opportunity.category ? [opportunity.category] : []),
    ...(opportunity.country ? [opportunity.country] : []),
    ...(opportunity.locationType ? [opportunity.locationType] : []),
    ...(opportunity.fundingType ? [opportunity.fundingType] : []),
    ...(opportunity.degreeLevels.length ? [opportunity.degreeLevels.join(', ')] : []),
  ];

  const mainContent = (
    <ScrollView
      contentContainerStyle={[
        styles.scroll,
        isDesktop && styles.scrollDesktop,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Hero */}
      {opportunity.imageUrl ? (
        <Image
          source={{ uri: opportunity.imageUrl }}
          style={styles.heroImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.heroPlaceholder}>
          <Text style={styles.heroInitial}>{orgInitial}</Text>
        </View>
      )}

      {/* Content */}
      <View style={styles.body}>
        <Text style={[styles.title, getWebFontStyle('bold')]}>{opportunity.title}</Text>
        <Text style={styles.org}>{opportunity.organization}</Text>

        <DeadlineBadge deadline={opportunity.deadline} />

        {metaParts.length > 0 ? (
          <Text style={styles.meta}>{metaParts.join('  ·  ')}</Text>
        ) : null}

        {opportunity.tags.length > 0 ? (
          <View style={styles.tagRow}>
            {opportunity.tags.map((tag) => (
              <View key={tag} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.divider} />

        <Text style={[styles.sectionHeading, getWebFontStyle('semibold')]}>
          About this opportunity
        </Text>
        <Text style={styles.description}>
          {opportunity.description?.trim() ||
            'No description provided for this opportunity.'}
        </Text>

        {/* Action buttons — inside scroll so user scrolls to find them */}
        <View style={styles.actionSection}>
          <Button fullWidth onPress={() => applyNow(opportunity)}>
            Apply Now
          </Button>
          <View style={styles.secondaryRow}>
            <Button
              variant="secondary"
              style={styles.flexBtn}
              onPress={toggleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaved ? '✓ Saved' : 'Save'}
            </Button>
            <Button
              variant={isApplied ? 'primary' : 'secondary'}
              style={styles.flexBtn}
              onPress={toggleApplied}
              loading={isApplying}
              disabled={isApplying}
            >
              {isApplied ? 'Applied ✓' : 'Mark applied'}
            </Button>
          </View>
        </View>

        {/* Related opportunities at the bottom on mobile */}
        {!isDesktop && relatedOpportunities.length > 0 && (
          <View style={styles.mobileRelatedSection}>
            <Text style={[styles.sidebarHeading, getWebFontStyle('semibold')]}>
              You might also like
            </Text>
            {relatedOpportunities.map((o) => (
              <RelatedOpportunityCard key={o.id} opportunity={o} onPress={handleRelatedPress} />
            ))}
          </View>
        )}

        {/* Share Section at the bottom on mobile */}
        {!isDesktop && (
          <View style={[styles.mobileShareWrapper, relatedOpportunities.length > 0 && styles.mobileShareBorder]}>
            {shareSection}
          </View>
        )}
      </View>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      <PageHeader title="Opportunity Details" />

      {isDesktop ? (
        <View style={styles.desktopLayout}>
          <View style={styles.mainCol}>{mainContent}</View>
          <View style={styles.sidebarCol}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {relatedOpportunities.length > 0 && (
                <>
                  <Text style={[styles.sidebarHeading, getWebFontStyle('semibold')]}>
                    You might also like
                  </Text>
                  {relatedOpportunities.map((o) => (
                    <RelatedOpportunityCard key={o.id} opportunity={o} onPress={handleRelatedPress} />
                  ))}
                  <View style={styles.sidebarDivider} />
                </>
              )}
              <View style={styles.desktopShareWrapper}>
                {shareSection}
              </View>
            </ScrollView>
          </View>
        </View>
      ) : (
        mainContent
      )}
    </View>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBody: { padding: spacing.lg, gap: spacing.md },

  // Desktop two-column layout
  desktopLayout: {
    flex: 1,
    flexDirection: 'row',
    maxWidth: 1280,
    width: '100%',
    alignSelf: 'center',
  },
  mainCol: { flex: 2 },
  sidebarCol: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  sidebarHeading: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
    letterSpacing: -0.1,
  },

  scroll: {
    paddingBottom: spacing.xl * 2,
  },
  scrollDesktop: {
    // no maxWidth here — the desktopLayout handles constraint
  },

  // ─── Hero ──────────────────────────────────────────────────────────────────
  heroImage: { width: '100%', height: 240 },
  heroPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroInitial: {
    fontSize: 72,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: -3,
  },

  // ─── Body — plain text ─────────────────────────────────────────────────────
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 34,
    letterSpacing: -0.4,
  },
  org: {
    fontSize: 16,
    color: colors.textMuted,
    fontWeight: '500',
    marginTop: -spacing.xs,
  },

  deadlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs + 2,
    borderRadius: 999,
  },
  deadlineText: { fontSize: 13, fontWeight: '600' },

  meta: {
    fontSize: 14,
    color: colors.textMuted,
    lineHeight: 20,
    textTransform: 'capitalize',
  },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    backgroundColor: `${colors.primary}0D`,
    borderWidth: 1,
    borderColor: `${colors.primary}25`,
  },
  tagText: { fontSize: 12, color: colors.primary, fontWeight: '500' },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },

  sectionHeading: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: -0.1,
  },
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 28,
  },

  // ─── Action buttons (below description, inside scroll) ─────────────────────
  actionSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
  },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  flexBtn: { flex: 1 },

  // Social Sharing Layout
  shareSectionInner: {
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  shareLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  shareIconsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  shareIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Mobile Related Layout
  mobileRelatedSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingBottom: spacing.sm,
  },

  desktopShareWrapper: {
    marginTop: spacing.sm,
  },
  mobileShareWrapper: {
    marginTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  mobileShareBorder: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    paddingTop: spacing.lg,
  },
  sidebarDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // ─── Related opportunity card ───────────────────────────────────────────────
  relatedCard: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  relatedThumb: { width: 60, height: 60, borderRadius: 8 },
  relatedThumbPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relatedThumbLetter: { color: colors.background, fontWeight: '700', fontSize: 18 },
  relatedBody: { flex: 1, gap: 2 },
  relatedTitle: { fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: 18 },
  relatedOrg: { fontSize: 12, color: colors.textMuted },
  relatedDeadline: { fontSize: 12, color: colors.primary, fontWeight: '500' },
});
}
