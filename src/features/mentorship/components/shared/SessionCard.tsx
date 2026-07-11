import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import type { ColorScheme } from '@/constants/theme/types';
import { useThemedStyles } from '@/hooks/useThemedStyles';
import { useTheme } from '@/hooks/useTheme';

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
  const { colors } = useTheme();
  const { t } = useTranslation();
  const canJoin =
    session.meetingUrl &&
    session.status !== 'cancelled' &&
    session.status !== 'completed' &&
    new Date(session.scheduledEnd).getTime() > Date.now();

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.title}>{session.title ?? t('mentorship.session.titleFallback')}</Text>
        <View style={[styles.status, statusStyle(session.status, colors.surface)]}>
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
          onPress={() => void openExternalUrl(session.meetingUrl!)}
          style={[styles.join, styles.joinGreen]}
        >
          {t('mentorship.session.joinSession')}
        </Button>
      ) : null}

      {showActions ? (
        <View style={styles.actions}>
          {onConfirm && session.status === 'proposed' ? (
            <Button variant="secondary" onPress={onConfirm}>
              {t('mentorship.session.confirm')}
            </Button>
          ) : null}
          {onReschedule ? (
            <Pressable onPress={onReschedule}>
              <Text style={styles.link}>{t('mentorship.session.reschedule')}</Text>
            </Pressable>
          ) : null}
          {onCancel && session.status !== 'cancelled' && session.status !== 'completed' ? (
            <Pressable onPress={onCancel}>
              <Text style={[styles.link, styles.danger]}>{t('mentorship.session.cancel')}</Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function statusStyle(status: string, surfaceColor: string) {
  if (status === 'confirmed') return { backgroundColor: '#E8F5EE' };
  if (status === 'cancelled') return { backgroundColor: '#FDECEC' };
  if (status === 'completed') return { backgroundColor: surfaceColor };
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
  joinGreen: { backgroundColor: '#16A34A' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, marginTop: spacing.sm },
  link: { color: colors.primary, fontWeight: '600' },
  danger: { color: colors.error },
});
}
