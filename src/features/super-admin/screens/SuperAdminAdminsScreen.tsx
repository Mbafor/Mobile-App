import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { Button } from '@/components/ui/Button';
import { Text } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { AdminDataTable, type AdminTableColumn } from '@/features/admin/components/AdminDataTable';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { spacing } from '@/constants/theme';
import { superAdminApi, type SuperAdminAdminRow } from '@/services/api/super-admin.api';

const PAGE_SIZE = 15;

export function SuperAdminAdminsScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const queryClient = useQueryClient();

  const invalidate = () => void queryClient.invalidateQueries({ queryKey: ['superAdmin'] });

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
    mutationFn: async (email: string) => {
      const result = await superAdminApi.promoteAdminByEmail(email, true);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      setNewAdminEmail('');
      Alert.alert(t('superAdmin.admins.promoteSuccessTitle'), t('superAdmin.admins.promoteSuccessMessage'));
    },
    onError: (e: Error) => Alert.alert(t('superAdmin.admins.promoteFailedTitle'), e.message),
  });

  const revokeMutation = useMutation({
    mutationFn: async (userId: string) => {
      const result = await superAdminApi.setAdmin(userId, false);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidate();
      Alert.alert(t('superAdmin.admins.revokeSuccessTitle'), t('superAdmin.admins.revokeSuccessMessage'));
    },
    onError: (e: Error) => Alert.alert(t('superAdmin.admins.revokeFailedTitle'), e.message),
  });

  const columns = useMemo<AdminTableColumn<SuperAdminAdminRow>[]>(
    () => [
      {
        key: 'name',
        header: t('superAdmin.admins.columns.name'),
        flex: 2,
        minWidth: 140,
        render: (row) => <Text style={styles.cellText}>{row.full_name ?? '—'}</Text>,
      },
      {
        key: 'email',
        header: t('superAdmin.admins.columns.email'),
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
        header: t('superAdmin.admins.columns.role'),
        minWidth: 120,
        render: (row) => (
          <Text variant="caption">
            {row.is_super_admin
              ? t('superAdmin.admins.roleLabels.superAdmin')
              : row.is_admin
                ? t('superAdmin.admins.roleLabels.opportunityAdmin')
                : '—'}
          </Text>
        ),
      },
      {
        key: 'posts',
        header: t('superAdmin.admins.columns.posts'),
        minWidth: 72,
        render: (row) => (
          <Text style={styles.postCount}>{row.opportunities_posted ?? 0}</Text>
        ),
      },
      {
        key: 'actions',
        header: t('superAdmin.admins.columns.actions'),
        minWidth: 100,
        render: (row) =>
          row.is_admin && !row.is_super_admin ? (
            <Button
              variant="ghost"
              disabled={revokeMutation.isPending}
              onPress={() => {
                Alert.alert(
                  t('superAdmin.admins.removeConfirmTitle'),
                  t('superAdmin.admins.removeConfirmMessage', {
                    email: row.email ?? t('superAdmin.admins.thisUser'),
                  }),
                  [
                    { text: t('superAdmin.admins.cancel'), style: 'cancel' },
                    {
                      text: t('superAdmin.admins.remove'),
                      style: 'destructive',
                      onPress: () => revokeMutation.mutate(row.id),
                    },
                  ],
                );
              }}
              textStyle={{ color: colors.error }}
            >
              {revokeMutation.isPending ? t('superAdmin.admins.removing') : t('superAdmin.admins.remove')}
            </Button>
          ) : (
            <Text muted variant="caption">—</Text>
          ),
      },
    ],
    [revokeMutation, t, colors, styles],
  );

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.pageTitle}>{t('superAdmin.admins.pageTitle')}</Text>
      <Text muted style={styles.intro}>
        {t('superAdmin.admins.intro')}
      </Text>

      <View style={styles.addCard}>
        <Text style={styles.cardLabel}>{t('superAdmin.admins.addCardLabel')}</Text>
        <View style={styles.addRow}>
          <Input
            value={newAdminEmail}
            onChangeText={setNewAdminEmail}
            placeholder={t('superAdmin.admins.emailPlaceholder')}
            style={styles.emailInput}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Button
            onPress={() => {
              const email = newAdminEmail.trim();
              if (!email.includes('@') || !email.includes('.')) {
                Alert.alert(t('superAdmin.admins.invalidEmailTitle'), t('superAdmin.admins.invalidEmailMessage'));
                return;
              }
              promoteMutation.mutate(email);
            }}
            loading={promoteMutation.isPending}
            disabled={!newAdminEmail.trim() || promoteMutation.isPending}
          >
            {t('superAdmin.admins.add')}
          </Button>
        </View>
        <Text variant="caption" muted>
          {t('superAdmin.admins.addHint')}
        </Text>
      </View>

      <SearchFilterBar
        value={search}
        onChangeText={(text) => { setSearch(text); setPage(0); }}
        placeholder={t('superAdmin.admins.searchPlaceholder')}
      />

      {isLoading ? <ActivityIndicator color={colors.primary} style={styles.loader} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : t('superAdmin.admins.genericError')} /> : null}

      {data ? (
        <>
          <AdminDataTable
            columns={columns}
            data={data.items}
            keyExtractor={(row) => row.id}
            emptyMessage={t('superAdmin.admins.emptySearch')}
          />
          <PaginationBar page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
        </>
      ) : null}
    </ScrollView>
  );
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
  loader: { marginVertical: spacing.lg },
  cellText: { fontWeight: '600' },
  postCount: { fontWeight: '700', color: colors.primary },
});
}
