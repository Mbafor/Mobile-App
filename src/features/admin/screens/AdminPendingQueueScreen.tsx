import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import type { ColorScheme } from '@/constants/theme/types';
import { ROUTES } from '@/constants/routes';
import { usePendingOpportunities } from '@/features/admin/hooks/useAdminOpportunities';
import {
  useApproveOpportunityMutation,
  useRejectOpportunityMutation,
} from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useTheme } from '@/hooks/useTheme';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { formatDeadline } from '@/utils/formatting';
import type { Opportunity } from '@/types/domain/opportunity';

export function AdminPendingQueueScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const router = useRouter();
  const { data: pending, isLoading, error, refetch, isRefetching } = usePendingOpportunities();
  const approveMutation = useApproveOpportunityMutation();
  const rejectMutation = useRejectOpportunityMutation();

  const handleApprove = (item: Opportunity) => {
    Alert.alert(
      'Approve opportunity',
      `Make "${item.title}" visible to students?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: () => approveMutation.mutate({ id: item.id }),
        },
      ],
    );
  };

  const handleReject = (item: Opportunity) => {
    Alert.alert(
      'Reject opportunity',
      `Remove "${item.title}" from the queue? It will not be shown to students.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => rejectMutation.mutate({ id: item.id }),
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <Text style={styles.heroTitle}>Pending review</Text>
        <Text muted style={styles.heroSub}>
          Scraped opportunities waiting for approval. Approved listings go live for students immediately.
        </Text>
      </View>

      {error ? (
        <View style={styles.padded}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load pending opportunities'}
          />
        </View>
      ) : (
        <FlatList
          data={pending ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>All caught up</Text>
              <Text muted>No scraped opportunities are waiting for review.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Pressable
                style={styles.cardBody}
                onPress={() => router.push(ROUTES.ADMIN.pendingReview(item.id) as Href)}
              >
                <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                <Text muted style={styles.cardOrg}>{item.organization}</Text>

                <View style={styles.meta}>
                  {item.category ? (
                    <View style={styles.tag}>
                      <Text style={styles.tagText}>{item.category}</Text>
                    </View>
                  ) : null}
                  {item.source ? (
                    <View style={[styles.tag, styles.sourceTag]}>
                      <Text style={styles.tagText}>{item.source}</Text>
                    </View>
                  ) : null}
                </View>

                <Text variant="caption" muted style={styles.deadline}>
                  Deadline: {formatDeadline(item.deadline)}
                </Text>

                <Text variant="caption" style={styles.tapHint}>Tap to review & edit →</Text>
              </Pressable>

              <View style={styles.actions}>
                <Pressable
                  style={[styles.actionBtn, styles.approveBtn]}
                  onPress={() => handleApprove(item)}
                >
                  <Text style={styles.approveBtnText}>Quick approve</Text>
                </Pressable>
                <Pressable
                  style={[styles.actionBtn, styles.rejectBtn]}
                  onPress={() => handleReject(item)}
                >
                  <Text style={styles.rejectBtnText}>Reject</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
    centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    hero: {
      padding: spacing.md,
      gap: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    heroTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
    heroSub: { lineHeight: 20 },
    padded: { padding: spacing.md },
    list: { padding: spacing.md, gap: spacing.sm },
    empty: { alignItems: 'center', paddingVertical: spacing.xl, gap: spacing.xs },
    emptyTitle: { fontSize: 17, fontWeight: '600' },
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      padding: spacing.md,
      gap: spacing.sm,
    },
    cardBody: { gap: 4 },
    cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text, lineHeight: 20 },
    cardOrg: { fontSize: 13 },
    meta: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginTop: 6 },
    tag: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 4,
      backgroundColor: colors.border,
    },
    sourceTag: { backgroundColor: colors.primary + '18' },
    tagText: { fontSize: 11, fontWeight: '600', color: colors.textMuted },
    deadline: { marginTop: 4 },
    tapHint: { marginTop: 6, color: colors.primary, fontSize: 12 },
    actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xs },
    actionBtn: {
      flex: 1,
      paddingVertical: 10,
      borderRadius: 8,
      alignItems: 'center',
    },
    approveBtn: { backgroundColor: colors.primary },
    rejectBtn: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: colors.error,
    },
    approveBtnText: { color: '#ffffff', fontWeight: '600', fontSize: 14 },
    rejectBtnText: { color: colors.error, fontWeight: '600', fontSize: 14 },
  });
}
