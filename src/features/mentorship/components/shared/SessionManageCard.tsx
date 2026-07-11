import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { Alert, Modal, Pressable, StyleSheet, View } from 'react-native';
import { openExternalUrl } from '@/utils/web/openExternalUrl';

import { Text } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
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
  const styles = useAppThemedStyles(createStyles);
  const { t } = useTranslation();
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
      Alert.alert(t('mentorship.session.invalidLinkTitle'), t('mentorship.session.invalidLinkMessage'));
      return;
    }
    if (!onSetMeetingUrl) return;
    setSavingUrl(true);
    try {
      await onSetMeetingUrl(session.id, url);
      setZoomOpen(false);
      Alert.alert(t('mentorship.session.linkSavedTitle'), t('mentorship.session.linkSavedMessage'));
    } catch (e) {
      Alert.alert(t('mentorship.session.errorTitle'), e instanceof Error ? e.message : t('mentorship.session.saveLinkError'));
    } finally {
      setSavingUrl(false);
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.datetime}>
        {formatSessionDateTime(session.scheduledStart, session.timezone)}
      </Text>
      {coachName ? <Text style={styles.coach}>{t('mentorship.session.coachPrefix', { name: coachName })}</Text> : null}
      {session.notes ? (
        <View style={styles.notesBox}>
          <Text style={styles.notesLabel}>{t('mentorship.session.note')}</Text>
          <Text style={styles.notes}>{session.notes}</Text>
        </View>
      ) : (
        <Text variant="caption" muted>
          {session.title ?? t('mentorship.session.titleFallback')}
        </Text>
      )}
      {session.meetingUrl ? (
        <Text variant="caption" style={styles.linkHint} numberOfLines={1}>
          {t('mentorship.session.linkAdded')}
        </Text>
      ) : null}

      <View style={styles.footer}>
        <Text style={styles.status}>
          {isPendingSessionStatus(session.status) ? t('mentorship.session.statusPending') : session.status}
        </Text>
        <View style={styles.actions}>
          {canJoin ? (
            <Pressable
              style={styles.primaryBtn}
              onPress={() => void openExternalUrl(session.meetingUrl!)}
            >
              <Text style={styles.primaryBtnText}>{t('mentorship.session.join')}</Text>
            </Pressable>
          ) : null}
          {awaitingLink ? (
            <Text variant="caption" muted style={styles.waiting}>
              {t('mentorship.session.awaitingLink')}
            </Text>
          ) : null}
          {role === 'coach' && onConfirm && isPendingSessionStatus(session.status) ? (
            <Pressable onPress={() => onConfirm(session.id)}>
              <Text style={styles.confirm}>{t('mentorship.session.confirm')}</Text>
            </Pressable>
          ) : null}
          {role === 'coach' && onSetMeetingUrl && isActive ? (
            <Pressable onPress={() => setZoomOpen(true)}>
              <Text style={styles.confirm}>
                {session.meetingUrl ? t('mentorship.session.editLink') : t('mentorship.session.addLink')}
              </Text>
            </Pressable>
          ) : null}
          {role === 'mentee' && onCancel && isActive ? (
            studentMayCancel ? (
              <Pressable
                onPress={() => {
                  Alert.alert(t('mentorship.session.cancelTitle'), t('mentorship.session.cancelMessage'), [
                    { text: t('mentorship.session.no'), style: 'cancel' },
                    { text: t('mentorship.session.yes'), style: 'destructive', onPress: () => onCancel(session.id) },
                  ]);
                }}
              >
                <Text style={styles.danger}>{t('mentorship.session.cancel')}</Text>
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
                Alert.alert(t('mentorship.session.cancelTitle'), t('mentorship.session.cancelMessageCoach'), [
                  { text: t('mentorship.session.no'), style: 'cancel' },
                  { text: t('mentorship.session.yes'), style: 'destructive', onPress: () => onCancel(session.id) },
                ]);
              }}
            >
              <Text style={styles.danger}>{t('mentorship.session.cancel')}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>

      <Modal visible={zoomOpen} transparent animationType="slide" onRequestClose={() => setZoomOpen(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setZoomOpen(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{t('mentorship.session.meetingLinkTitle')}</Text>
            <Text muted variant="caption">
              {t('mentorship.session.meetingLinkHint')}
            </Text>
            <Input
              value={zoomUrl}
              onChangeText={setZoomUrl}
              placeholder="https://meet.jit.si/voila-session-…"
              autoCapitalize="none"
              keyboardType="url"
            />
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setZoomOpen(false)}>
                {t('mentorship.session.cancel')}
              </Button>
              <Button onPress={() => void saveZoom()} loading={savingUrl}>
                {t('mentorship.session.saveLink')}
              </Button>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
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
    backgroundColor: colors.success,
  },
  primaryBtnText: { color: mentorshipColors.textOnAccent, fontWeight: '600', fontSize: 13 },
  confirm: { color: mentorshipColors.accent, fontWeight: '600', fontSize: 13 },
  danger: { color: mentorshipColors.danger, fontWeight: '600', fontSize: 13 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
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
}
