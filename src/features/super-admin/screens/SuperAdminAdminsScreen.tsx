import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { AdminDataTable, type AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { colors, spacing } from '@/constants/theme';
import { superAdminApi, type SuperAdminAdminRow } from '@/services/api/super-admin.api';

const PAGE_SIZE = 15;

export function SuperAdminAdminsScreen() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.superAdmin.admins(search, page),
    queryFn: async () => {
      const result = await superAdminApi.listAdmins({
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const promoteMutation = useMutation({
    mutationFn: (email: string) => superAdminApi.promoteAdminByEmail(email, true),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      setNewAdminEmail('');
      Alert.alert('Success', 'User promoted to opportunity admin.');
    },
    onError: (e: Error) => Alert.alert('Failed', e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: (userId: string) => superAdminApi.setAdmin(userId, false),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['superAdmin'] }),
    onError: (e: Error) => Alert.alert('Failed', e.message),
  });

  const columns = useMemo<AdminTableColumn<SuperAdminAdminRow>[]>(
    () => [
      {
        key: 'name',
        header: 'Name',
        flex: 2,
        minWidth: 140,
        render: (row) => <Text style={styles.cellText}>{row.full_name ?? '—'}</Text>,
      },
      {
        key: 'email',
        header: 'Email',
        flex: 2,
        minWidth: 180,
        render: (row) => (
          <Text variant="caption" muted numberOfLines={1}>
            {row.email ?? '—'}
          </Text>
        ),
      },
      {
        key: 'role',
        header: 'Role',
        minWidth: 120,
        render: (row) => (
          <Text variant="caption">
            {row.is_super_admin ? 'Super Admin' : row.is_admin ? 'Opportunity Admin' : '—'}
          </Text>
        ),
      },
      {
        key: 'posts',
        header: 'Posts',
        minWidth: 72,
        render: (row) => (
          <Text style={styles.postCount}>{row.opportunities_posted ?? 0}</Text>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        minWidth: 100,
        render: (row) =>
          row.is_admin && !row.is_super_admin ? (
            <Button
              variant="ghost"
              onPress={() => {
                Alert.alert('Remove admin', `Revoke admin access for ${row.email}?`, [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => revokeMutation.mutate(row.id),
                  },
                ]);
              }}
              textStyle={{ color: colors.error }}
            >
              Delete
            </Button>
          ) : (
            <Text muted variant="caption">
              —
            </Text>
          ),
      },
    ],
    [revokeMutation],
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.pageTitle}>Manage admins</Text>
      <Text muted style={styles.intro}>
        Opportunity admins can create and manage listings. Super admins retain full platform access.
      </Text>

      <View style={styles.addCard}>
        <Text style={styles.cardLabel}>Add opportunity admin</Text>
        <View style={styles.addRow}>
          <Input
            value={newAdminEmail}
            onChangeText={setNewAdminEmail}
            placeholder="existing-user@email.com"
            style={styles.emailInput}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={() => promoteMutation.mutate(newAdminEmail.trim())}
            loading={promoteMutation.isPending}
            disabled={!newAdminEmail.trim()}
          >
            Add
          </Button>
        </View>
        <Text variant="caption" muted>
          The user must already have signed up. Promoting grants the Admin tab and opportunity tools.
        </Text>
      </View>

      <SearchFilterBar
        value={search}
        onChangeText={(t) => {
          setSearch(t);
          setPage(0);
        }}
        placeholder="Search by name or email…"
      />

      {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : 'Error'} /> : null}

      {data ? (
        <>
          <AdminDataTable
            columns={columns}
            data={data.items}
            keyExtractor={(row) => row.id}
            emptyMessage="No admins match your search."
          />
          <PaginationBar page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2, gap: spacing.md },
  pageTitle: { fontSize: 22, fontWeight: '700', color: colors.text },
  intro: { lineHeight: 22 },
  addCard: {
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    gap: spacing.sm,
  },
  cardLabel: { fontWeight: '700', fontSize: 15 },
  addRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center' },
  emailInput: { flex: 1 },
  loader: { marginVertical: spacing.lg },
  cellText: { fontWeight: '600' },
  postCount: { fontWeight: '700', color: colors.primary },
});
