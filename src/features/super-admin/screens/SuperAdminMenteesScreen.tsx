import { useQuery } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ErrorMessage } from '@/components/feedback';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Text } from '@/components/ui';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { spacing } from '@/constants/theme';
import { superAdminApi } from '@/services/api';

const PAGE_SIZE = 15;

export function SuperAdminMenteesScreen() {
  const styles = useThemedStyles(createStyles);
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading, error } = useQuery({
    queryKey: queryKeys.superAdmin.mentees(search, page),
    queryFn: async () => {
      const result = await superAdminApi.listMentees({
        search: search.trim() || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SearchFilterBar value={search} onChangeText={(text) => { setSearch(text); setPage(0); }} placeholder={t('superAdmin.mentees.searchPlaceholder')} />
      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : t('superAdmin.mentees.genericError')} /> : null}
      {data?.items.length === 0 && !isLoading ? (
        <EmptyState title={t('superAdmin.mentees.emptyTitle')} description={t('superAdmin.mentees.emptyDescription')} />
      ) : null}
      {data?.items.map((m) => (
        <View key={m.mentorship_id} style={styles.card}>
          <Text style={styles.name}>{m.student_name ?? t('superAdmin.mentees.studentFallback')}</Text>
          <Text muted variant="caption">{m.student_email}</Text>
          <Text variant="caption">{t('superAdmin.mentees.coachLabel', { name: m.mentor_name ?? '—' })}</Text>
          <Text variant="caption">
            {new Date(m.started_at).toLocaleDateString()} → {new Date(m.ends_at).toLocaleDateString()}
          </Text>
        </View>
      ))}
      {data ? (
        <PaginationBar page={page} pageSize={PAGE_SIZE} total={data.total} onPageChange={setPage} />
      ) : null}
    </ScrollView>
  );
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
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
}
