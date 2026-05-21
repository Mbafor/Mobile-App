import { useRouter, type Href } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { ROUTES } from '@/constants/routes';
import { colors, spacing } from '@/constants/theme';
import { useAdminOpportunities } from '@/features/admin/hooks/useAdminOpportunities';
import { useDeleteOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { formatDeadline } from '@/utils/formatting';

export function AdminOpportunitiesScreen() {
  const router = useRouter();
  const { isReady } = useRequireAdmin();
  const { data: opportunities, isLoading, error, refetch, isRefetching } = useAdminOpportunities();
  const deleteMutation = useDeleteOpportunityMutation();

  const confirmDelete = (id: string, title: string) => {
    Alert.alert(
      'Delete opportunity',
      `Delete "${title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  if (!isReady || isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.header}>
        <Text variant="title">Opportunities</Text>
        <Button onPress={() => router.push(ROUTES.ADMIN.CREATE as Href)}>Create</Button>
      </View>

      {error ? (
        <View style={styles.padded}>
          <ErrorMessage
            message={error instanceof Error ? error.message : 'Failed to load opportunities'}
          />
        </View>
      ) : (
        <FlatList
          data={opportunities ?? []}
          keyExtractor={(item) => item.id}
          refreshing={isRefetching}
          onRefresh={() => void refetch()}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <Text muted style={styles.padded}>
              No opportunities yet.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text muted>{item.organization}</Text>
                <Text muted style={styles.deadline}>
                  Deadline: {formatDeadline(item.deadline)}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => router.push(ROUTES.ADMIN.edit(item.id) as Href)}>
                  <Text style={styles.link}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(item.id, item.title)}>
                  <Text style={styles.danger}>Delete</Text>
                </Pressable>
              </View>
            </View>
          )}
        />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    gap: spacing.sm,
  },
  padded: { padding: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600', fontSize: 16 },
  deadline: { fontSize: 12, marginTop: 2 },
  rowActions: { justifyContent: 'center', gap: spacing.sm, alignItems: 'flex-end' },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error, fontWeight: '600' },
});
