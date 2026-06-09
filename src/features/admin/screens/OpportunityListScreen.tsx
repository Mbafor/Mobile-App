import { useRouter, type Href } from 'expo-router';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { ActivityIndicator, Alert, FlatList, Image, Pressable, StyleSheet, View } from 'react-native';

import { confirmAction } from '@/utils/confirm-action';

import { ErrorMessage } from '@/components/feedback';
import { Screen } from '@/components/layout';
import { Button, Text } from '@/components/ui';
import { spacing } from '@/constants/theme';
import { useAdminOpportunities } from '@/features/admin/hooks/useAdminOpportunities';
import { useDeleteOpportunityMutation } from '@/features/admin/hooks/useAdminOpportunityMutations';
import { formatDeadline } from '@/utils/formatting';

export type OpportunityListRoutes = {
  create: Href;
  paste: Href;
  edit: (id: string) => Href;
};

type OpportunityListScreenProps = {
  routes: OpportunityListRoutes;
  title?: string;
  subtitle?: string;
};

export function OpportunityListScreen({
  routes,
  title = 'Opportunities',
  subtitle = 'Create, paste, edit, or remove listings shown to students.',
}: OpportunityListScreenProps) {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const { data: opportunities, isLoading, error, refetch, isRefetching } = useAdminOpportunities();
  const deleteMutation = useDeleteOpportunityMutation();

  const confirmDelete = async (id: string, oppTitle: string) => {
    const confirmed = await confirmAction(
      'Delete opportunity',
      `Delete "${oppTitle}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) {
      Alert.alert(
        'Delete failed',
        e instanceof Error ? e.message : 'Could not delete this opportunity.',
      );
    }
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
        <Text style={styles.heroTitle}>{title}</Text>
        <Text muted style={styles.heroSub}>
          {subtitle}
        </Text>
        <View style={styles.heroActions}>
          <Button variant="secondary" onPress={() => router.push(routes.paste)}>
            Paste JSON
          </Button>
          <Button onPress={() => router.push(routes.create)}>Create new</Button>
        </View>
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
              No opportunities yet. Create one or paste JSON to get started.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.row}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumb} resizeMode="cover" />
              ) : (
                <View style={[styles.thumb, styles.thumbPlaceholder]}>
                  <Text style={styles.thumbLetter}>{item.organization.charAt(0)}</Text>
                </View>
              )}
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{item.title}</Text>
                <Text muted>{item.organization}</Text>
                <Text variant="caption" muted style={styles.deadline}>
                  Deadline: {formatDeadline(item.deadline)}
                </Text>
              </View>
              <View style={styles.rowActions}>
                <Pressable onPress={() => router.push(routes.edit(item.id))}>
                  <Text style={styles.link}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => void confirmDelete(item.id, item.title)}>
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
  heroSub: { lineHeight: 20, marginBottom: spacing.sm },
  heroActions: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'flex-end' },
  padded: { padding: spacing.md },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, gap: spacing.sm },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: colors.border,
  },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  thumbLetter: { fontSize: 20, fontWeight: '700', color: colors.textMuted },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontWeight: '600', fontSize: 16 },
  deadline: { marginTop: 2 },
  rowActions: { justifyContent: 'center', gap: spacing.sm, alignItems: 'flex-end' },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error, fontWeight: '600' },
});
}
