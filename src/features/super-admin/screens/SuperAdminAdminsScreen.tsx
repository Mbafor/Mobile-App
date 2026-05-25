import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { colors, spacing } from '@/constants/theme';
import { superAdminApi } from '@/services/api';

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

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text muted style={styles.intro}>
        Opportunity admins can create and manage listings. Promote an existing user by email.
      </Text>
      <View style={styles.promoteRow}>
        <Input
          value={newAdminEmail}
          onChangeText={setNewAdminEmail}
          placeholder="user@email.com"
          style={styles.emailInput}
        />
        <Button
          onPress={() => promoteMutation.mutate(newAdminEmail.trim())}
          loading={promoteMutation.isPending}
          disabled={!newAdminEmail.trim()}
        >
          Add admin
        </Button>
      </View>

      <SearchFilterBar value={search} onChangeText={(t) => { setSearch(t); setPage(0); }} placeholder="Search admins…" />
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : 'Error'} /> : null}

      {data?.items.map((a) => (
        <View key={a.id} style={styles.card}>
          <Text style={styles.name}>{a.full_name ?? 'Unnamed'}</Text>
          <Text muted variant="caption">{a.email}</Text>
          <Text variant="caption">
            {a.is_super_admin ? 'Super Admin' : a.is_admin ? 'Opportunity Admin' : '—'} ·{' '}
            {a.audit_actions} audit actions
          </Text>
          {a.is_admin && !a.is_super_admin ? (
            <Button variant="ghost" onPress={() => revokeMutation.mutate(a.id)} textStyle={{ color: colors.error }}>
              Revoke admin
            </Button>
          ) : null}
        </View>
      ))}

      {data ? (
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  intro: { marginBottom: spacing.md, lineHeight: 22 },
  promoteRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', marginBottom: spacing.md },
  emailInput: { flex: 1 },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.sm,
    gap: 4,
  },
  name: { fontWeight: '600', fontSize: 16 },
});
