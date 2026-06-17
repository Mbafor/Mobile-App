import { Linking, Pressable, ScrollView, StyleSheet, View, Alert } from 'react-native';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Ionicons } from '@expo/vector-icons';

import { Text } from '@/components/ui';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import {
  canStudentCancelSession,
  isPendingSessionStatus,
} from '@/features/mentorship/utils/session-rules';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type SessionsTableProps = {
  sessions: MentorshipSession[];
  coachName: string;
  coachEmail?: string | null;
  title?: string;
  isVerifiedMentor?: boolean;
  onCancel?: (sessionId: string) => void;
};

export function SessionsTable({
  sessions,
  coachName,
  coachEmail,
  title,
  isVerifiedMentor = false,
  onCancel,
}: SessionsTableProps) {
  const styles = useAppThemedStyles(createStyles);
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.heading}>{title}</Text> : null}
      <View style={styles.tableShell}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View style={styles.tableHeader}>
            <HeaderCell label="Coach Details" width={220} />
            <HeaderCell label="Session Type" width={150} />
            <HeaderCell label="Date & Time" width={220} />
            <HeaderCell label="My Notes" width={230} />
            <HeaderCell label="Status" width={130} />
            <HeaderCell label="Actions" width={210} />
          </View>

          {sessions.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text muted>No upcoming sessions scheduled.</Text>
            </View>
          ) : (
            sessions.map((session) => (
              <View key={session.id} style={styles.row}>
                <View style={[styles.cell, { width: 220 }]}>
                  <View style={styles.nameRow}>
                    <Text style={styles.primaryText}>{coachName}</Text>
                    {isVerifiedMentor ? (
                      <Ionicons name="checkmark-circle" size={14} color="#0B6623" />
                    ) : null}
                  </View>
                  {coachEmail ? (
                    <Text variant="caption" muted numberOfLines={1}>
                      {coachEmail}
                    </Text>
                  ) : null}
                </View>
                <CellText width={150} text={session.title?.trim() || 'Mentorship session'} />
                <CellText
                  width={220}
                  text={formatSessionDateTime(session.scheduledStart, session.timezone)}
                />
                <View style={[styles.cell, { width: 230 }]}>
                  {session.notes?.trim() ? (
                    <Pressable onPress={() => Alert.alert('My note', session.notes!.trim())}>
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.notesText}>
                        {session.notes}
                      </Text>
                    </Pressable>
                  ) : (
                    <Text variant="caption" muted>
                      No note
                    </Text>
                  )}
                </View>
                <View style={[styles.cell, { width: 130 }]}>
                  <StatusPill session={session} />
                </View>
                <View style={[styles.cell, styles.actionsCell, { width: 210 }]}>
                  <Pressable
                    style={[styles.joinBtn, !session.meetingUrl ? styles.joinBtnDisabled : null]}
                    onPress={() => {
                      if (session.meetingUrl) {
                        void Linking.openURL(session.meetingUrl);
                      } else {
                        Alert.alert('No meeting link yet', 'Your coach will share a meeting link soon.');
                      }
                    }}
                  >
                    <Ionicons name="videocam-outline" size={14} color="#fff" />
                    <Text style={styles.joinBtnText}>Join now</Text>
                  </Pressable>
                  {onCancel && canStudentCancelSession(session) ? (
                    <Pressable
                      style={styles.cancelBtn}
                      onPress={() => onCancel(session.id)}
                    >
                      <Text style={styles.cancelText}>Cancel</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
      </View>
    </View>
  );
}

function StatusPill({ session }: { session: MentorshipSession }) {
  const styles = useAppThemedStyles(createStyles);
  const pending = isPendingSessionStatus(session.status);
  return (
    <View style={[styles.statusPill, pending ? styles.statusPillPending : styles.statusPillConfirmed]}>
      <View style={[styles.statusDot, pending ? styles.statusDotPending : styles.statusDotConfirmed]} />
      <Text style={[styles.statusText, pending ? styles.statusTextPending : styles.statusTextConfirmed]}>
        {pending ? 'Pending' : 'Confirmed'}
      </Text>
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

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  wrap: { gap: spacing.sm },
  heading: { fontSize: 17, fontWeight: '700', color: mentorshipColors.text },
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
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  primaryText: { color: mentorshipColors.text, fontSize: 14, fontWeight: '500', flexShrink: 1 },
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
  statusPillConfirmed: { backgroundColor: '#DCFCE7' },
  statusPillPending: { backgroundColor: '#FEF3C7' },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusDotConfirmed: { backgroundColor: '#16A34A' },
  statusDotPending: { backgroundColor: '#D97706' },
  statusText: { fontSize: 12, fontWeight: '700' },
  statusTextConfirmed: { color: '#166534' },
  statusTextPending: { color: '#92400E' },
  cancelHint: { maxWidth: 120 },
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
  cancelBtn: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.sm,
    paddingVertical: 7,
    backgroundColor: mentorshipColors.surface,
  },
  cancelText: { color: mentorshipColors.danger, fontSize: 12, fontWeight: '600' },
  emptyRow: { padding: spacing.lg, alignItems: 'center' },
});
}
