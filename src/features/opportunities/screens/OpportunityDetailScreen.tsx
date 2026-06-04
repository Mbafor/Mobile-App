import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button, Text } from '@/components/ui';
import { useOpportunityDetail } from '@/features/opportunities/hooks/useOpportunityDetail';
import { useOpportunityEngagement } from '@/features/opportunities/hooks/useOpportunityEngagement';
import { colors, spacing } from '@/constants/theme';
import { getWebFontStyle } from '@/constants/theme/webTheme';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';

function DeadlineBadge({ deadline }: { deadline: string }) {
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

export function OpportunityDetailScreen() {
  const router = useRouter();
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
    shareOpportunity,
  } = useOpportunityEngagement(opportunityId);

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

  return (
    <View style={styles.root}>
      <PageHeader title="Opportunity Details" />

      <ScrollView
        contentContainerStyle={styles.scroll}
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

        {/* Content — plain text, no cards */}
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
        </View>
      </ScrollView>

      {/* Sticky footer */}
      <View style={styles.footer}>
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
            variant="secondary"
            style={styles.flexBtn}
            onPress={() => shareOpportunity(opportunity)}
          >
            Share
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
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorBody: { padding: spacing.lg, gap: spacing.md },

  scroll: {
    paddingBottom: spacing.xl * 2,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
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

  // ─── Footer ────────────────────────────────────────────────────────────────
  footer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.lg : spacing.md,
    gap: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    maxWidth: 1100,
    width: '100%',
    alignSelf: 'center',
  },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  flexBtn: { flex: 1 },
});
