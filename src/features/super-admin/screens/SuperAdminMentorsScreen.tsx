import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
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
import { TextArea } from '@/components/ui/TextArea';
import { Input } from '@/components/ui/Input';
import { PaginationBar } from '@/features/super-admin/components/PaginationBar';
import { SearchFilterBar } from '@/features/super-admin/components/SearchFilterBar';
import { queryKeys } from '@/constants/query-keys';
import { colors, spacing } from '@/constants/theme';
import { superAdminApi } from '@/services/api';

const PAGE_SIZE = 15;

export function SuperAdminMentorsScreen() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
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

  const approveMutation = useMutation({
    mutationFn: (userId: string) => superAdminApi.approveMentor(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['superAdmin'] });
      Alert.alert('Approved', 'Mentor account is now active.');
    },
    onError: (e: Error) => Alert.alert('Failed', e.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, next }: { userId: string; next: string }) =>
      superAdminApi.setMentorStatus(userId, next),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ['superAdmin'] }),
    onError: (e: Error) => Alert.alert('Failed', e.message),
  });

  const broadcastMutation = useMutation({
    mutationFn: () => superAdminApi.broadcastToMentors(broadcastSubject, broadcastBody),
    onSuccess: (res) => {
      if (res.success) {
        Alert.alert('Sent', `Broadcast delivered to ${(res.data as { recipients?: number })?.recipients ?? 0} mentors.`);
        setBroadcastSubject('');
        setBroadcastBody('');
      }
    },
    onError: (e: Error) => Alert.alert('Failed', e.message),
  });

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <SearchFilterBar value={search} onChangeText={(t) => { setSearch(t); setPage(0); }} placeholder="Search mentors…" />
      <View style={styles.filters}>
        {['pending', 'approved', 'suspended', null].map((s) => (
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

      <View style={styles.broadcast}>
        <Text style={styles.sectionTitle}>Broadcast to mentors</Text>
        <Input value={broadcastSubject} onChangeText={setBroadcastSubject} placeholder="Subject" />
        <TextArea value={broadcastBody} onChangeText={setBroadcastBody} placeholder="Message" minHeight={80} />
        <Button
          onPress={() => broadcastMutation.mutate()}
          loading={broadcastMutation.isPending}
          disabled={!broadcastSubject.trim() || !broadcastBody.trim()}
        >
          Send to all approved mentors
        </Button>
      </View>

      {isLoading ? <ActivityIndicator color={colors.primary} /> : null}
      {error ? <ErrorMessage message={error instanceof Error ? error.message : 'Error'} /> : null}

      {data?.items.length === 0 && !isLoading ? (
        <EmptyState title="No mentors" description="Try adjusting filters." />
      ) : null}

      {data?.items.map((m) => (
        <View key={m.user_id} style={styles.card}>
          <Text style={styles.name}>{m.full_name ?? 'Unnamed'}</Text>
          <Text muted variant="caption">{m.email}</Text>
          <Text variant="caption">
            {m.status} · {m.active_mentees}/{m.max_students} mentees
          </Text>
          <View style={styles.actions}>
            {m.status === 'pending' ? (
              <Button variant="secondary" onPress={() => approveMutation.mutate(m.user_id)}>
                Approve
              </Button>
            ) : null}
            {m.status === 'approved' ? (
              <Button
                variant="ghost"
                onPress={() => statusMutation.mutate({ userId: m.user_id, next: 'suspended' })}
              >
                Deactivate
              </Button>
            ) : null}
            {m.status === 'suspended' ? (
              <Button
                variant="secondary"
                onPress={() => approveMutation.mutate(m.user_id)}
              >
                Reactivate
              </Button>
            ) : null}
          </View>
        </View>
      ))}

      {data ? (
        <PaginationBar
          page={page}
          pageSize={PAGE_SIZE}
          total={data.total}
          onPageChange={setPage}
        />
      ) : null}
      <Button variant="ghost" onPress={() => void refetch()} style={styles.refresh}>
        Refresh
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  filterChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterActiveText: { color: colors.background, fontWeight: '600' },
  broadcast: { gap: spacing.sm, marginBottom: spacing.lg, padding: spacing.md, backgroundColor: colors.surface, borderRadius: 12 },
  sectionTitle: { fontWeight: '700' },
  card: {
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    marginBottom: spacing.sm,
    gap: 4,
  },
  name: { fontWeight: '600', fontSize: 16 },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  refresh: { marginTop: spacing.md },
});
