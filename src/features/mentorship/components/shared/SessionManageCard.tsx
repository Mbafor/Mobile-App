import { useState } from 'react';
import { Alert, Linking, Modal, Pressable, StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { formatSessionDateTime } from '@/features/mentorship/utils/format-session';
import {
  canJoinGoogleMeet,
  canStudentCancelSession,
  isPendingSessionStatus,
  studentCancelBlockedMessage,
} from '@/features/mentorship/utils/session-rules';
import type { MentorshipSession } from '@/types/domain/mentorship';
import { spacing } from '@/constants/theme';

type SessionManageCardProps = {
  session: MentorshipSession;
  role: 'coach' | 'mentee';
  coachName?: string;
  onConfirm?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  onSetMeetingUrl?: (sessionId: string, url: string) => Promise<void>;
};

export function SessionManageCard({
  session,
  role,
  coachName,
  onConfirm,
  onCancel,
  onSetMeetingUrl,
}: SessionManageCardProps) {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomUrl, setZoomUrl] = useState(session.meetingUrl ?? '');
  const [savingUrl, setSavingUrl] = useState(false);

  const isActive =
    session.status !== 'cancelled' && session.status !== 'completed';
  const canJoin = role === 'mentee' && canJoinGoogleMeet(session);
  const awaitingLink =
    role === 'mentee' &&
    session.status === 'confirmed' &&
    !session.meetingUrl &&
    isActive;
  const studentMayCancel = role === 'mentee' && canStudentCancelSession(session);

  const saveZoom = async () => {
    const url = zoomUrl.trim();
    if (!url.startsWith('http')) {
      Alert.alert('Invalid link', 'Enter a valid Zoom or meeting URL (https://…).');
      return;
    }
    if (!onSetMeetingUrl) return;
    setSavingUrl(true);
    try {
      await onSetMeetingUrl(session.id, url);
      setZoomOpen(false);
      Alert.alert('Link saved', 'Your mentee can join when the session starts.');
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : 'Could not save link.');
    } finally {
      setSavingUrl(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.datetime}>
        {formatSessionDateTime(session.scheduledStart, session.timezone)}
      </Text>
      {coachName ? <Text style={styles.coach}>Coach: {coachName}</Text> : null}
      {session.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>Session note</Text>
          <Text style={styles.notes}>{session.notes}</Text>
        </View>
      ) : (
        <Text variant="caption" muted>
          {session.title ?? 'Mentorship session'}
        </Text>
      )}
      {session.meetingUrl ? (
        <Text variant="caption" style={styles.linkHint} numberOfLines={1}>
          Meeting link added
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.status}>
          {isPendingSessionStatus(session.status) ? 'pending' : session.status}
        </Text>
        <View style={styles.actions}>
          {canJoin ? (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => void Linking.openURL(session.meetingUrl!)}
            >
              <Text style={styles.primaryBtnText}>Join on Google Meet</Text>
            </Pressable>
          ) : null}
          {awaitingLink ? (
            <Text variant="caption" muted style={styles.waiting}>
              Waiting for coach to confirm and share Meet link
            </Text>
          ) : null}
          {role === 'mentee' && session.status === 'confirmed' && session.meetingUrl && !canJoin ? (
            <Text variant="caption" muted style={styles.waiting}>
              Join opens 15 minutes before the session
            </Text>
          ) : null}
          {role === 'coach' && onConfirm && isPendingSessionStatus(session.status) ? (
            <Pressable onPress={() => onConfirm(session.id)}>
              <Text style={styles.confirm}>Confirm</Text>
            </Pressable>
          ) : null}
          {role === 'coach' && onSetMeetingUrl && isActive ? (
            <Pressable onPress={() => setZoomOpen(true)}>
              <Text style={styles.confirm}>
                {session.meetingUrl ? 'Edit link' : 'Add Zoom link'}
              </Text>
            </Pressable>
          ) : null}
          {role === 'mentee' && onCancel && isActive ? (
            studentMayCancel ? (
              <Pressable
                onPress={() => {
                  Alert.alert('Cancel session', 'Cancel this session?', [
                    { text: 'No', style: 'cancel' },
                    { text: 'Yes', style: 'destructive', onPress: () => onCancel(session.id) },
                  ]);
                }}
              >
                <Text style={styles.danger}>Cancel</Text>
              </Pressable>
            ) : (
              <Text variant="caption" muted style={styles.waiting}>
                {studentCancelBlockedMessage(session)}
              </Text>
            )
          ) : null}
          {role === 'coach' && onCancel && isActive ? (
            <Pressable
              onPress={() => {
                Alert.alert('Cancel session', 'Cancel this session? The student will be notified.', [
                  { text: 'No', style: 'cancel' },
                  { text: 'Yes', style: 'destructive', onPress: () => onCancel(session.id) },
                ]);
              }}
            >
              <Text style={styles.danger}>Cancel</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Modal visible={zoomOpen} transparent animationType="slide" onRequestClose={() => setZoomOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setZoomOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>Google Meet / meeting link</Text>
            <Text muted variant="caption">
              Share this with your mentee before the session starts.
            </Text>
            <Input
              value={zoomUrl}
              onChangeText={setZoomUrl}
              placeholder="https://zoom.us/j/…"
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setZoomOpen(false)}>
                Cancel
              </Button>
              <Button onPress={() => void saveZoom()} loading={savingUrl}>
                Save link
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { padding: spacing.md, gap: spacing.xs },
  datetime: { fontSize: 16, fontWeight: '700', color: mentorshipColors.text },
  coach: { fontSize: 14, fontWeight: '500', color: mentorshipColors.text },
  notesBox: {
    marginTop: spacing.xs,
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: mentorshipColors.accentMuted,
    gap: 4,
  },
  notesLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: mentorshipColors.accent,
    textTransform: 'uppercase',
  },
  notes: { fontSize: 14, color: mentorshipColors.text, lineHeight: 20 },
  linkHint: { color: mentorshipColors.accent, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: mentorshipColors.textMuted,
  },
  actions: { flex: 1, alignItems: 'flex-end', gap: spacing.sm },
  waiting: { textAlign: 'right', maxWidth: 180 },
  primaryBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
    backgroundColor: mentorshipColors.accent,
  },
  primaryBtnText: { color: mentorshipColors.textOnAccent, fontWeight: '600', fontSize: 13 },
  confirm: { color: mentorshipColors.accent, fontWeight: '600', fontSize: 13 },
  danger: { color: mentorshipColors.danger, fontWeight: '600', fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: mentorshipColors.surfaceElevated,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm, marginTop: spacing.sm },
});
