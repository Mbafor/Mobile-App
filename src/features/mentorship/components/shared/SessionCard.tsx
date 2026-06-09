import { Linking, Pressable, StyleSheet, View } from 'react-native';
import type { ColorScheme } from '@/constants/theme/types';
import { colors as themeColors } from '@/constants/theme/colors';
import { useThemedStyles } from '@/hooks/useThemedStyles';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type SessionCardProps = {
  session: MentorshipSession;
  onConfirm?: () => void;
  onCancel?: () => void;
  onReschedule?: () => void;
  showActions?: boolean;
};

export function SessionCard({
  session,
  onConfirm,
  onCancel,
  onReschedule,
  showActions,
}: SessionCardProps) {
  const styles = useThemedStyles(createStyles);
  const canJoin =
    session.meetingUrl &&
    session.status !== 'cancelled' &&
    session.status !== 'completed' &&
    new Date(session.scheduledEnd).getTime() > Date.now();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{session.title ?? 'Mentorship session'}</Text>
        <View style={[styles.status, statusStyle(session.status)]}>
          <Text style={styles.statusText}>{session.status}</Text>
        </View>
      </View>
      <Text muted>{formatSessionDateTime(session.scheduledStart, session.timezone)}</Text>
      {session.notes ? (
        <Text variant="caption" muted>
          {session.notes}
        </Text>
      ) : null}

      {canJoin ? (
        <Button
          variant="primary"
          onPress={() => void Linking.openURL(session.meetingUrl!)}
          style={styles.join}
        >
          Join session
        </Button>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          {onConfirm && session.status === 'proposed' ? (
            <Button variant="secondary" onPress={onConfirm}>
              Confirm
            </Button>
          ) : null}
          {onReschedule ? (
            <Pressable onPress={onReschedule}>
              <Text style={styles.link}>Reschedule</Text>
            </Pressable>
          ) : null}
          {onCancel && session.status !== 'cancelled' && session.status !== 'completed' ? (
            <Pressable onPress={onCancel}>
              <Text style={[styles.link, styles.danger]}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function statusStyle(status: string) {
  if (status === 'confirmed') return { backgroundColor: '#E8F5EE' };
  if (status === 'cancelled') return { backgroundColor: '#FDECEC' };
  if (status === 'completed') return { backgroundColor: themeColors.surface };
  return { backgroundColor: '#FFF4E5' };
}

function createStyles(colors: ColorScheme) {
  return StyleSheet.create({
  card: {
    gap: spacing.xs,
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: '600', flex: 1 },
  status: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  join: { marginTop: spacing.sm },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error },
});
}
