import { Ionicons } from '@expo/vector-icons';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Head from 'expo-router/head';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Image,
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
import { openExternalUrl } from '@/utils/web/openExternalUrl';

function PromoCard({
  icon,
  iconColor,
  iconBg,
  badge,
  title,
  body,
  ctaLabel,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: string;
  badge?: string;
  title: string;
  body: string;
  ctaLabel: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <Pressable
      style={({ pressed }) => [styles.promoCard, pressed && { opacity: 0.82 }]}
      onPress={onPress}
      accessibilityRole="button"
    >
      <View style={styles.promoCardTop}>
        <View style={[styles.promoIconBox, { backgroundColor: iconBg }]}>
          <Ionicons name={icon} size={17} color={iconColor} />
        </View>
        {badge ? (
          <View style={[styles.promoBadge, { backgroundColor: iconBg }]}>
            <Text style={[styles.promoBadgeText, { color: iconColor }]}>{badge}</Text>
          </View>
        ) : null}
      </View>
      <Text style={styles.promoTitle}>{title}</Text>
      <Text style={styles.promoBody}>{body}</Text>
      <View style={styles.promoCta}>
        <Text style={[styles.promoCtaText, { color: iconColor }]}>{ctaLabel}</Text>
        <Ionicons name="arrow-forward" size={12} color={iconColor} />
      </View>
    </Pressable>
  );
}

function DeadlineBadge({ deadline }: { deadline: string | null }) {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const days = daysUntilDeadline(deadline);
  const label = formatDeadline(deadline);
  const urgent = days >= 0 && days <= 7;
  const expired = days < 0;

  const bg = colors.surface;
  const textColor = colors.text;
  const iconName: keyof typeof Ionicons.glyphMap = expired
    ? 'time-outline'
    : urgent
    ? 'alert-circle-outline'
    : 'calendar-outline';

  return (
    <View style={[styles.deadlineBadge, { backgroundColor: bg }]}>
      <Ionicons name={iconName} size={13} color={textColor} />
      <Text style={[styles.deadlineText, { color: textColor }]}>
        {expired ? t('opportunities.detail.deadlinePassed') : `${label}${days > 0 ? ` · ${t('opportunities.common.daysLeft', { days })}` : ''}`}
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
  const { t } = useTranslation();
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
          {daysLeft > 0 ? ` · ${t('opportunities.common.daysLeft', { days: daysLeft })}` : ''}
        </Text>
      </View>
    </Pressable>
  );
}

export function OpportunityDetailScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
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
        <Text style={styles.shareLabel}>{t('opportunities.detail.shareVia')}</Text>
        <View style={styles.shareIconsRow}>
          <Pressable
            style={({ pressed }) => [
              styles.shareIconBtn,
              { backgroundColor: '#EAF8F2' },
              pressed && { opacity: 0.75 },
            ]}
            onPress={() => {
              const text = buildShareMessage(opportunity, opportunityLink);
              void openExternalUrl(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('opportunities.detail.shareWhatsapp')}
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
              void openExternalUrl(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(opportunityLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('opportunities.detail.shareLinkedin')}
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
              void openExternalUrl(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(opportunityLink)}`);
            }}
            accessibilityRole="button"
            accessibilityLabel={t('opportunities.detail.shareFacebook')}
          >
            <Ionicons name="logo-facebook" size={20} color="#1877F2" />
          </Pressable>
        </View>
      </View>
    );
  }, [opportunity, opportunityLink, t]);

  const defaultOgImage = `${process.env.EXPO_PUBLIC_LANDING_URL ?? 'https://voila-africa.com'}/og-image.png`;
  const ogImage = opportunity?.imageUrl ?? defaultOgImage;

  const ogTitle = useMemo(
    () => (opportunity ? `${opportunity.title} | Voila` : 'Voila'),
    [opportunity],
  );

  const ogDescription = useMemo(() => {
    const raw = opportunity?.description?.trim() ?? '';
    if (!raw) return t('opportunities.detail.ogDescriptionDefault');
    return raw.length > 155 ? `${raw.slice(0, 152)}...` : raw;
  }, [opportunity, t]);

  const promoSection = useMemo(
    () => (
      <View style={styles.promoSection}>
        <PromoCard
          icon="document-text-outline"
          iconColor={colors.primary}
          iconBg="#E8F5ED"
          badge={t('opportunities.detail.promos.cvBadge')}
          title={t('opportunities.detail.promos.cvTitle')}
          body={t('opportunities.detail.promos.cvBody')}
          ctaLabel={t('opportunities.detail.promos.cvCta')}
          onPress={() => router.push('/(main)/(tabs)/cv-builder')}
        />
        <PromoCard
          icon="people-outline"
          iconColor="#1D6FA4"
          iconBg="#E3F0FA"
          badge="1:1"
          title={t('opportunities.detail.promos.mentorTitle')}
          body={t('opportunities.detail.promos.mentorBody')}
          ctaLabel={t('opportunities.detail.promos.mentorCta')}
          onPress={() => router.push('/(main)/(tabs)/mentorship')}
        />
        <PromoCard
          icon="logo-whatsapp"
          iconColor="#25D366"
          iconBg="#E6FBF0"
          title={t('opportunities.detail.promos.whatsappTitle')}
          body={t('opportunities.detail.promos.whatsappBody')}
          ctaLabel={t('opportunities.detail.promos.whatsappCta')}
          onPress={() => {
            const url =
              process.env.EXPO_PUBLIC_WHATSAPP_CHANNEL_URL ??
              'https://whatsapp.com/channel/0029VbBtgba6xCSPUQdGPO2C';
            openExternalUrl(url).catch(() => void openExternalUrl('https://www.whatsapp.com/channel/0029VbBtgba6xCSPUQdGPO2C'));
          }}
        />
      </View>
    ),
    [router, styles, colors, t],
  );

  const headTags = (
    <Head>
      <title>{ogTitle}</title>
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      {opportunityLink ? <meta property="og:url" content={opportunityLink} /> : null}
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      {opportunityLink ? <link rel="canonical" href={opportunityLink} /> : null}
    </Head>
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        {headTags}
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !opportunity) {
    return (
      <View style={styles.root}>
        {headTags}
        <PageHeader title={t('opportunities.detail.header')} />
        <View style={styles.errorBody}>
          <ErrorMessage
            message={error instanceof Error ? error.message : t('opportunities.detail.notFound')}
          />
          <Button variant="secondary" onPress={() => router.back()}>
            {t('opportunities.detail.goBack')}
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
          {t('opportunities.detail.about')}
        </Text>
        <Text style={styles.description}>
          {opportunity.description?.trim() ||
            t('opportunities.detail.noDescription')}
        </Text>

        {/* Action buttons — inside scroll so user scrolls to find them */}
        <View style={styles.actionSection}>
          <Button fullWidth onPress={() => applyNow(opportunity)}>
            {t('opportunities.detail.applyNow')}
          </Button>
          <View style={styles.secondaryRow}>
            <Button
              variant="secondary"
              style={styles.flexBtn}
              onPress={toggleSave}
              loading={isSaving}
              disabled={isSaving}
            >
              {isSaved ? t('opportunities.detail.saved') : t('opportunities.detail.save')}
            </Button>
            <Button
              variant={isApplied ? 'primary' : 'secondary'}
              style={styles.flexBtn}
              onPress={toggleApplied}
              loading={isApplying}
              disabled={isApplying}
            >
              {isApplied ? t('opportunities.detail.applied') : t('opportunities.detail.markApplied')}
            </Button>
          </View>
          {/* Share links — directly below the action buttons */}
          <View style={styles.inlineShareWrapper}>
            {shareSection}
          </View>
        </View>

        {/* Related opportunities at the bottom on mobile */}
        {!isDesktop && relatedOpportunities.length > 0 && (
          <View style={styles.mobileRelatedSection}>
            <Text style={[styles.sidebarHeading, getWebFontStyle('semibold')]}>
              {t('opportunities.detail.youMightAlsoLike')}
            </Text>
            {relatedOpportunities.map((o) => (
              <RelatedOpportunityCard key={o.id} opportunity={o} onPress={handleRelatedPress} />
            ))}
          </View>
        )}

        {/* Voila services promo — mobile */}
        {!isDesktop && (
          <View style={styles.mobilePromoWrapper}>
            {promoSection}
          </View>
        )}

      </View>
    </ScrollView>
  );

  return (
    <View style={styles.root}>
      {headTags}
      <PageHeader title={t('opportunities.detail.header')} />

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
              {promoSection}
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
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
    color: `${colors.textOnPrimary}E6`,
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 12, color: colors.text, fontWeight: '500' },

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

  // Share section — inline below the action buttons
  inlineShareWrapper: {
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },

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

  sidebarDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.lg,
  },

  // ─── Voila service promo cards ─────────────────────────────────────────────
  promoSection: {
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  promoCard: {
    padding: spacing.md,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    gap: spacing.xs + 1,
  },
  promoCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  promoIconBox: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promoBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  promoBadgeText: {
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: colors.text,
    letterSpacing: -0.1,
  },
  promoBody: {
    fontSize: 12,
    color: colors.textMuted,
    lineHeight: 17,
  },
  promoCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  promoCtaText: {
    fontSize: 12,
    fontWeight: '700' as const,
  },
  mobilePromoWrapper: {
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
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
  relatedThumbLetter: { color: colors.textOnPrimary, fontWeight: '700', fontSize: 18 },
  relatedBody: { flex: 1, gap: 2 },
  relatedTitle: { fontSize: 13, fontWeight: '600', color: colors.text, lineHeight: 18 },
  relatedOrg: { fontSize: 12, color: colors.textMuted },
  relatedDeadline: { fontSize: 12, color: colors.primary, fontWeight: '500' },
});
}
