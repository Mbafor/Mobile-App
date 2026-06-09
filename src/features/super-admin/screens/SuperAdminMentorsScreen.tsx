import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { AdminDataTable, type AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { spacing } from '@/constants/theme';
import { colors as themeColors } from '@/constants/theme/colors';
import { superAdminApi, type SuperAdminMentorRow } from '@/services/api/super-admin.api';

const PAGE_SIZE = 15;

export function SuperAdminMentorsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [newMentorEmail, setNewMentorEmail] = useState('');
  const queryClient = useQueryClient();

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['superAdmin'] });

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.superAdmin.mentors(search, status, page),
    queryFn: async () => {
      const result = await superAdminApi.listMentors({
        search: search.trim() || undefined,
        status,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (email: string) => {
      const result = await superAdminApi.createMentorByEmail(email);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      setNewMentorEmail('');
      Alert.alert('Mentor created', 'Coach profile is approved and ready.');
    },
    onError: (e: Error) => Alert.alert('Failed to create mentor', e.message),
  });

  const approveMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await superAdminApi.approveMentor(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      Alert.alert('Approved', 'Mentor has been approved.');
    },
    onError: (e: Error) => Alert.alert('Failed to approve mentor', e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await superAdminApi.deleteMentor(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      Alert.alert('Deleted', 'Mentor profile has been removed.');
    },
    onError: (e: Error) => Alert.alert('Failed to delete mentor', e.message),
  });

  const columns = useMemo<AdminTableColumn<SuperAdminMentorRow>[]>(
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
        key: 'status',
        header: 'Status',
        minWidth: 100,
        render: (row) => (
          <Text variant="caption" style={statusStyle(row.status)}>
            {row.status}
          </Text>
        ),
      },
      {
        key: 'mentees',
        header: 'Mentees',
        minWidth: 80,
        render: (row) => (
          <Text variant="caption">{row.active_mentees}/{row.max_students}</Text>
        ),
      },
      {
        key: 'actions',
        header: 'Actions',
        minWidth: 160,
        render: (row) => (
          <View style={styles.rowActions}>
            {row.status === 'pending' ? (
              <Pressable
                disabled={approveMutation.isPending}
                onPress={() => approveMutation.mutate(row.user_id)}
              >
                <Text style={styles.link}>
                  {approveMutation.isPending ? 'Approving…' : 'Approve'}
                </Text>
              </Pressable>
            ) : null}
            <Pressable
              disabled={deleteMutation.isPending}
              onPress={() => {
                Alert.alert(
                  'Delete mentor',
                  `Remove coach profile for ${row.email ?? 'this user'}?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => deleteMutation.mutate(row.user_id),
                    },
                  ],
                );
              }}
            >
              <Text style={[styles.danger, deleteMutation.isPending && styles.dimmed]}>
                {deleteMutation.isPending ? 'Deleting…' : 'Delete'}
              </Text>
            </Pressable>
          </View>
        ),
      },
    ],
    [approveMutation, deleteMutation],
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.pageTitle}>Manage mentors</Text>
      <Text muted style={styles.intro}>
        Create approved mentor profiles by email, approve pending applications, or remove mentors.
      </Text>

      <View style={styles.addCard}>
        <Text style={styles.cardLabel}>Create mentor</Text>
        <View style={styles.addRow}>
          <Input
            value={newMentorEmail}
            onChangeText={setNewMentorEmail}
            placeholder="user@email.com"
            style={styles.emailInput}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={() => createMutation.mutate(newMentorEmail.trim())}
            loading={createMutation.isPending}
            disabled={!newMentorEmail.trim() || createMutation.isPending}
          >
            Add
          </Button>
        </View>
        <Text variant="caption" muted>
          The user must already have an account. They'll be immediately approved as a mentor.
        </Text>
      </View>

      <SearchFilterBar
        value={search}
        onChangeText={(t) => { setSearch(t); setPage(0); }}
        placeholder="Search mentors…"
      />

      <View style={styles.filters}>
        {(['pending', 'approved', 'suspended', null] as const).map((s) => (
          <Pressable
            key={String(s)}
            style={[styles.filterChip, status === s && styles.filterChipActive]}
            onPress={() => { setStatus(s); setPage(0); }}
          >
            <Text style={status === s ? styles.filterActiveText : undefined}>
              {s ?? 'All'}
            </Text>
          </Pressable>
        ))}
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : 'Error'} /> : null}

      {data?.items.length === 0 && !isLoading ? (
        <EmptyState title="No mentors" description="Try adjusting filters or add a mentor by email." />
      ) : null}

      {data && data.items.length > 0 ? (
        <>
          <AdminDataTable
            columns={columns}
            data={data.items}
            keyExtractor={(row) => row.user_id}
          />
          <PaginationBar page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
        </>
      ) : null}
    </ScrollView>
  );
}

function statusStyle(status: string) {
  if (status === 'approved') return { color: themeColors.success, fontWeight: '600' as const };
  if (status === 'pending') return { color: '#B45309', fontWeight: '600' as const };
  if (status === 'suspended') return { color: themeColors.error, fontWeight: '600' as const };
  return undefined;
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
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
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterActiveText: { color: colors.background, fontWeight: '600' },
  loader: { marginVertical: spacing.lg },
  cellText: { fontWeight: '600' },
  rowActions: { flexDirection: 'row', gap: spacing.md },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error, fontWeight: '600' },
  dimmed: { opacity: 0.5 },
});
}
