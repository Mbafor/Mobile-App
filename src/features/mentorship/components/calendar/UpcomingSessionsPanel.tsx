import { Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';

import { Text } from '@/components/ui';
import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import { calendarColors } from '@/features/mentorship/constants/calendar-colors';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import {
  canJoinGoogleMeet,
  canStudentCancelSession,
  isActiveSessionStatus,
  isPendingSessionStatus,
  studentCancelBlockedMessage,
} from '@/features/mentorship/utils/session-rules';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type UpcomingSessionsPanelProps = {
  sessions: MentorshipSession[];
  role: 'coach' | 'student';
  /** Static label (student view) or use getPeerName for per-session names (coach view). */
  peerLabel?: string;
  getPeerName?: (session: MentorshipSession) => string;
  onCancel?: (sessionId: string) => void;
  onConfirm?: (sessionId: string) => void;
};

function statusColor(status: string, mutedColor: string): string {
  if (status === 'cancelled') return calendarColors.cancelled;
  if (status === 'completed') return calendarColors.completed;
  if (isPendingSessionStatus(status)) return calendarColors.booked;
  if (status === 'confirmed') return calendarColors.booked;
  return mutedColor;
}

function statusLabel(status: string, t: TFunction): string {
  if (status === 'pending' || status === 'proposed') return t('mentorship.calendar.statusPending');
  return status;
}

export function UpcomingSessionsPanel({
  sessions,
  role,
  peerLabel: peerLabelProp,
  getPeerName,
  onCancel,
  onConfirm,
}: UpcomingSessionsPanelProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const peerLabel = peerLabelProp ?? t('mentorship.calendar.participantFallback');
  const upcoming = sessions
    .filter((s) => isActiveSessionStatus(s.status))
    .sort((a, b) => new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime());

  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{t('mentorship.calendar.upcomingHeading')}</Text>
      <MentorshipMobileList
        data={upcoming}
        keyExtractor={(s) => s.id}
        emptyMessage={t('mentorship.calendar.noUpcoming')}
        renderCard={(session) => {
          const showStudentCancel = role === 'student' && onCancel;
          const allowCancel = showStudentCancel && canStudentCancelSession(session);
          const canJoin = canJoinGoogleMeet(session);

          return (
            <View style={styles.card}>
              <Text style={styles.peer}>{getPeerName ? getPeerName(session) : peerLabel}</Text>
              <Text style={styles.datetime}>
                {formatSessionDateTime(session.scheduledStart, session.timezone)}
              </Text>
              <View style={styles.statusRow}>
                <View style={[styles.statusPill, { backgroundColor: statusColor(session.status, mentorshipColors.textMuted) }]}>
                  <Text style={styles.statusText}>{statusLabel(session.status, t)}</Text>
                </View>
              </View>
              <View style={styles.actions}>
                {role === 'coach' && onConfirm && isPendingSessionStatus(session.status) ? (
                  <Pressable onPress={() => onConfirm(session.id)}>
                    <Text style={styles.link}>{t('mentorship.calendar.confirmSession')}</Text>
                  </Pressable>
                ) : null}
                {canJoin && session.meetingUrl ? (
                  <Pressable
                    style={styles.meetBtn}
                    onPress={() => void openExternalUrl(session.meetingUrl!)}
                  >
                    <Text style={styles.meetBtnText}>{t('mentorship.calendar.join')}</Text>
                  </Pressable>
                ) : null}
                {showStudentCancel ? (
                  allowCancel ? (
                    <Pressable onPress={() => onCancel(session.id)}>
                      <Text style={styles.danger}>{t('mentorship.calendar.cancel')}</Text>
                    </Pressable>
                  ) : (
                    <Text variant="caption" muted>
                      {studentCancelBlockedMessage(session)}
                    </Text>
                  )
                ) : null}
                {role === 'coach' && onCancel ? (
                  <Pressable onPress={() => onCancel(session.id)}>
                    <Text style={styles.danger}>Cancel</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm, marginTop: spacing.md },
  heading: { fontSize: 17, fontWeight: '700', color: mentorshipColors.text },
  card: { padding: spacing.md, gap: spacing.xs },
  peer: { fontSize: 15, fontWeight: '600', color: mentorshipColors.text },
  datetime: { fontSize: 14, color: mentorshipColors.textMuted },
  statusRow: { flexDirection: 'row', marginTop: spacing.xs },
  statusPill: { paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 6 },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: calendarColors.textOnFill,
    textTransform: 'capitalize',
  },
  actions: { marginTop: spacing.sm, gap: spacing.sm, alignItems: 'flex-start' },
  link: { color: mentorshipColors.accent, fontWeight: '600' },
  meetBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: mentorshipColors.accent,
  },
  meetBtnText: { color: mentorshipColors.textOnAccent, fontWeight: '600' },
  danger: { color: mentorshipColors.danger, fontWeight: '600' },
});
}
