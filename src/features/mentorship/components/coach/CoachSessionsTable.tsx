import { Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type CoachSessionsTableProps = {
  sessions: MentorshipSession[];
  title?: string;
  isCompleted?: boolean;
  getMenteeDetails?: (session: MentorshipSession) => { name: string; email?: string | null };
  onConfirm?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onSetMeetingUrl?: (sessionId: string, url: string) => Promise<void>;
};

export function CoachSessionsTable({
  sessions,
  title,
  isCompleted,
  getMenteeDetails,
  onConfirm,
  onCancel,
  onSetMeetingUrl,
}: CoachSessionsTableProps) {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const isCompletedTable = isCompleted ?? title?.toLowerCase() === 'completed';
  const showUpcomingActions = !isCompletedTable;

  const handleJoinMeeting = (session: MentorshipSession) => {
    if (!session.meetingUrl) {
      Alert.alert(t('mentorship.coach.sessionsTable.noMeetingTitle'), t('mentorship.coach.sessionsTable.noMeetingMessage'));
      return;
    }
    void openExternalUrl(session.meetingUrl);
  };

  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.heading}>{title}</Text> : null}
      <View style={styles.tableShell}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View>
            <View style={styles.tableHeader}>
              <HeaderCell label={t('mentorship.coach.sessionsTable.colMentee')} width={220} />
              <HeaderCell label={t('mentorship.coach.sessionsTable.colType')} width={150} />
              <HeaderCell label={t('mentorship.coach.sessionsTable.colDateTime')} width={220} />
              <HeaderCell label={t('mentorship.coach.sessionsTable.colNotes')} width={230} />
              <HeaderCell label={t('mentorship.coach.sessionsTable.colStatus')} width={130} />
              <HeaderCell label={t('mentorship.coach.sessionsTable.colActions')} width={230} />
            </View>

            {sessions.length === 0 ? (
              <View style={styles.emptyRow}>
                <Text muted>{t('mentorship.coach.sessionsTable.empty')}</Text>
              </View>
            ) : (
              sessions.map((session) => {
                const mentee = getMenteeDetails?.(session) ?? { name: t('mentorship.coach.menteeFallback'), email: null };
                return (
                  <View key={session.id} style={styles.row}>
                    <View style={[styles.cell, { width: 220 }]}>
                      <Text style={styles.primaryText}>{mentee.name}</Text>
                      {mentee.email ? (
                        <Text variant="caption" muted numberOfLines={1}>
                          {mentee.email}
                        </Text>
                      ) : null}
                    </View>
                    <CellText width={150} text={session.title?.trim() || t('mentorship.coach.sessionsTable.sessionTitleFallback')} />
                    <CellText
                      width={220}
                      text={formatSessionDateTime(session.scheduledStart, session.timezone)}
                    />
                    <View style={[styles.cell, { width: 230 }]}>
                      {session.notes?.trim() ? (
                        <Pressable onPress={() => Alert.alert(t('mentorship.coach.sessionsTable.noteTitle'), session.notes!.trim())}>
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.notesText}>
                            {session.notes}
                          </Text>
                        </Pressable>
                      ) : (
                        <Text variant="caption" muted>
                          {t('mentorship.coach.sessionsTable.noNote')}
                        </Text>
                      )}
                    </View>
                    <View style={[styles.cell, { width: 130 }]}>
                      <StatusPill completed={isCompletedTable} />
                    </View>
                    <View style={[styles.cell, styles.actionsCell, { width: 230 }]}>
                      {showUpcomingActions ? (
                        <>
                          <Pressable
                            style={[
                              styles.joinBtn,
                              !session.meetingUrl ? styles.joinBtnDisabled : null,
                            ]}
                            onPress={() => handleJoinMeeting(session)}
                          >
                            <Ionicons name="videocam-outline" size={14} color={mentorshipColors.textOnAccent} />
                            <Text style={styles.joinBtnText}>{t('mentorship.coach.sessionsTable.join')}</Text>
                          </Pressable>
                          <Pressable
                            style={styles.iconBtn}
                            hitSlop={12}
                            onPress={() => {
                              if (onConfirm && session.status !== 'confirmed') {
                                onConfirm(session.id);
                                return;
                              }
                              if (onSetMeetingUrl) {
                                void onSetMeetingUrl(
                                  session.id,
                                  session.meetingUrl ?? 'https://meet.jit.si/mentorship-session',
                                );
                              }
                            }}
                            accessibilityLabel={
                              session.status === 'confirmed'
                                ? t('mentorship.coach.sessionsTable.editLink')
                                : t('mentorship.coach.sessionsTable.confirm')
                            }
                          >
                            <Ionicons
                              name={session.status === 'confirmed' ? 'create-outline' : 'checkmark-outline'}
                              size={16}
                              color={mentorshipColors.text}
                            />
                          </Pressable>
                          <Pressable
                            style={styles.iconBtn}
                            hitSlop={12}
                            onPress={() => onCancel?.(session.id)}
                            accessibilityLabel={t('mentorship.coach.sessionsTable.cancel')}
                            accessibilityRole="button"
                          >
                            <Ionicons
                              name="close-circle-outline"
                              size={16}
                              color={mentorshipColors.danger}
                            />
                          </Pressable>
                        </>
                      ) : (
                        <Pressable style={styles.secondaryAction}>
                          <Text style={styles.secondaryActionText}>{t('mentorship.coach.sessionsTable.viewDetails')}</Text>
                        </Pressable>
                      )}
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

function HeaderCell({ label, width }: { label: string; width: number }) {
  const styles = useAppThemedStyles(createStyles);
  return (
    <View style={[styles.headerCell, { width }]}>
      <Text style={styles.headerText}>{label}</Text>
    </View>
  );
}

function CellText({ width, text }: { width: number; text: string }) {
  const styles = useAppThemedStyles(createStyles);
  return (
    <View style={[styles.cell, { width }]}>
      <Text numberOfLines={2} style={styles.primaryText}>
        {text}
      </Text>
    </View>
  );
}

function StatusPill({ completed }: { completed: boolean }) {
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
  return (
    <View style={[styles.statusPill, completed ? styles.completedPill : styles.upcomingPill]}>
      <View style={[styles.dot, completed ? styles.completedDot : styles.upcomingDot]} />
      <Text style={[styles.statusText, completed ? styles.completedText : styles.upcomingText]}>
        {completed ? t('mentorship.coach.sessionsTable.statusCompleted') : t('mentorship.coach.sessionsTable.statusConfirmed')}
      </Text>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm, marginBottom: spacing.md },
  heading: { fontSize: 16, fontWeight: '600', color: mentorshipColors.text },
  tableShell: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: mentorshipColors.surfaceElevated,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: mentorshipColors.surface,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
  },
  headerCell: { paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  headerText: {
    fontSize: 12,
    color: mentorshipColors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: mentorshipColors.border,
    minHeight: 72,
  },
  cell: { justifyContent: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.sm },
  primaryText: { color: mentorshipColors.text, fontSize: 14, fontWeight: '500' },
  notesText: { color: mentorshipColors.text, fontSize: 13 },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: 'flex-start',
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
  upcomingPill: { backgroundColor: '#DCFCE7' },
  completedPill: { backgroundColor: '#F3F4F6' },
  upcomingDot: { backgroundColor: '#16A34A' },
  completedDot: { backgroundColor: '#6B7280' },
  statusText: { fontSize: 12, fontWeight: '700' },
  upcomingText: { color: '#166534' },
  completedText: { color: '#4B5563' },
  actionsCell: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  joinBtn: {
    height: 32,
    borderRadius: 10,
    backgroundColor: mentorshipColors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
  },
  joinBtnDisabled: { opacity: 0.55 },
  joinBtnText: { color: mentorshipColors.textOnAccent, fontSize: 12, fontWeight: '700' },
  iconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: mentorshipColors.surface,
  },
  secondaryAction: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    backgroundColor: mentorshipColors.surface,
  },
  secondaryActionText: { fontSize: 12, fontWeight: '600', color: mentorshipColors.textMuted },
  emptyRow: { padding: spacing.lg, alignItems: 'center' },
});
}
