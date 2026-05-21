import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { useOpportunityDetail } from '@/features/opportunities/hooks/useOpportunityDetail';
import { useOpportunityEngagement } from '@/features/opportunities/hooks/useOpportunityEngagement';
import { colors, spacing, typography } from '@/constants/theme';
import { formatDeadline, daysUntilDeadline } from '@/utils/formatting';

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
      <Screen>
        <ErrorMessage
          message={
            error instanceof Error ? error.message : 'Opportunity not found or has expired.'
          }
        />
        <Button variant="secondary" onPress={() => router.back()}>
          Go back
        </Button>
      </Screen>
    );
  }

  const daysLeft = daysUntilDeadline(opportunity.deadline);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          {opportunity.imageUrl ? (
            <Image
              source={{ uri: opportunity.imageUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Text style={styles.heroPlaceholderText}>
                {opportunity.organization.charAt(0)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <Text variant="title" style={styles.title}>
            {opportunity.title}
          </Text>
          <Text style={styles.org}>{opportunity.organization}</Text>
          <Text style={styles.deadline}>
            Deadline: {formatDeadline(opportunity.deadline)}
            {daysLeft > 0 ? ` · ${daysLeft} days left` : ''}
          </Text>

          {opportunity.tags.length > 0 ? (
            <View style={styles.tags}>
              {opportunity.tags.map((tag) => (
                <View key={tag} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <Text variant="title" style={styles.sectionTitle}>
            Description
          </Text>
          <Text style={styles.description}>
            {opportunity.description?.trim() ||
              'No description provided for this opportunity.'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={() => applyNow(opportunity)}>Apply Now</Button>
        <View style={styles.secondaryRow}>
          <Button
            variant="secondary"
            style={styles.flexBtn}
            onPress={toggleSave}
            loading={isSaving}
            disabled={isSaving}
          >
            {isSaved ? 'Saved' : 'Save'}
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
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingBottom: spacing.xl },
  hero: { backgroundColor: colors.surface },
  heroImage: { width: '100%', height: 220 },
  heroPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  heroPlaceholderText: { fontSize: 48, fontWeight: '700', color: colors.background },
  content: { padding: spacing.md, gap: spacing.sm },
  title: { fontSize: typography.fontSize.xl },
  org: { fontSize: typography.fontSize.md, color: colors.textMuted },
  deadline: { fontSize: typography.fontSize.sm, color: colors.primary, fontWeight: '600' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: spacing.xs },
  tag: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tagText: { fontSize: 12, color: colors.text },
  sectionTitle: { marginTop: spacing.md, fontSize: typography.fontSize.lg },
  description: {
    fontSize: typography.fontSize.md,
    color: colors.text,
    lineHeight: 22,
  },
  footer: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  secondaryRow: { flexDirection: 'row', gap: spacing.sm },
  flexBtn: { flex: 1 },
});
