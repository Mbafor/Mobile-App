import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useTheme } from '@/hooks/useTheme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Alert } from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { EmptyState } from '@/components/feedback/EmptyState';
import { Text, TextArea } from '@/components/ui';
import { Button } from '@/components/ui/Button';
import { StudentBookingCalendar } from '@/features/mentorship/components/calendar/StudentBookingCalendar';
import { CoachDashboardSummary } from '@/features/mentorship/components/student/CoachDashboardSummary';
import { CoachProfileCard } from '@/features/mentorship/components/student/CoachProfileCard';
import { SessionsTable } from '@/features/mentorship/components/student/SessionsTable';
import { MentorChooser } from '@/features/mentorship/components/student/MentorChooser';
import { WaitingListCard } from '@/features/mentorship/components/student/WaitingListCard';
import { MatchedBanner } from '@/features/mentorship/components/shared/MatchedBanner';
import { MentorshipChat } from '@/features/mentorship/components/shared/MentorshipChat';
import { MentorshipShell } from '@/features/mentorship/components/shared/MentorshipShell';
import { STUDENT_NAV_ITEMS } from '@/features/mentorship/constants/nav-items';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useMentorshipActions } from '@/features/mentorship/hooks/useMentorshipActions';
import { useMentorshipSchedulingRealtime } from '@/features/mentorship/hooks/useMentorshipSchedulingRealtime';
import {
  filterSessionsForMentorship,
  useMentorshipSessions,
  useSessionMutations,
} from '@/features/mentorship/hooks/useMentorshipSessions';
import { useMentorshipMessages } from '@/features/mentorship/hooks/useMentorshipMessages';
import { useStudentMentorship } from '@/features/mentorship/hooks/useStudentMentorship';
import { SupportContactHint } from '@/features/help/components/SupportContactHint';
import { spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';

export function StudentMentorshipDashboard() {
  const styles = useAppThemedStyles(createStyles);
  const { colors, mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectingMentorId, setSelectingMentorId] = useState<string | null>(null);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');

  const {
    activeMentorship,
    openRequest,
    waitingList,
    coach,
    isLoading,
    error,
    refetch,
  } = useStudentMentorship();

  const {
    chooseCoach,
    isChoosingCoach,
    joinWaitingList,
    isJoiningWaitingList,
    cancelRequest,
    isCancelling,
    leaveMentorship,
    isLeaving,
  } = useMentorshipActions();

  const mentorshipId = activeMentorship?.id;
  const mentorId = activeMentorship?.mentorId;

  useMentorshipSchedulingRealtime(userId, mentorshipId);
  const { messages, isLoading: messagesLoading, sendMessage, isSending } =
    useMentorshipMessages(mentorshipId, {
      enabled: activeSection === 'messages' && Boolean(mentorshipId),
      poll: activeSection === 'messages',
    });
  const { sessions, isLoading: sessionsLoading } = useMentorshipSessions(userId);
  const { book, cancel, isBooking } = useSessionMutations(userId);

  const mySessions = mentorshipId
    ? filterSessionsForMentorship(sessions, mentorshipId)
    : [];
  const myUpcoming = mentorshipId
    ? filterSessionsForMentorship(sessions, mentorshipId).filter(
        (s) => s.status !== 'cancelled' && s.status !== 'completed',
      )
    : [];

  const handleChooseCoach = (mentorUserId: string) => {
    if (!mentorUserId?.trim()) {
      Alert.alert(t('mentorship.student.selectCoachTitle'), t('mentorship.student.selectCoachMessage'));
      return;
    }
    setSelectingMentorId(mentorUserId);
    chooseCoach(mentorUserId, {
      onSettled: () => setSelectingMentorId(null),
      onSuccess: () => setActiveSection('dashboard'),
    });
  };

  const handleJoinWaitingList = () => {
    joinWaitingList(undefined, {
      onSuccess: (data) => {
        if (data.outcome === 'waiting_list') {
          setActiveSection('dashboard');
        }
      },
    });
  };

  const handleLeave = () => {
    if (!activeMentorship) return;
    setLeaveReason('');
    setShowLeaveModal(true);
  };

  const confirmLeave = () => {
    if (!activeMentorship) return;
    leaveMentorship(
      { mentorshipId: activeMentorship.id, reason: leaveReason.trim() || undefined },
      { onSuccess: () => setShowLeaveModal(false) },
    );
  };

  const handleCancelSession = async (sessionId: string) => {
    const ok = await confirmAction(
      t('mentorship.student.cancelSessionTitle'),
      t('mentorship.student.cancelSessionMessage'),
    );
    if (!ok) return;
    void cancel(sessionId, 'Cancelled by student').catch((e: Error) =>
      Alert.alert(t('mentorship.student.cancelErrorTitle'), e.message),
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={mentorshipColors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <ErrorMessage message={error instanceof Error ? error.message : t('mentorship.loadError')} />
        <Button onPress={() => void refetch()}>{t('mentorship.retry')}</Button>
      </View>
    );
  }

  const hasCoach = Boolean(activeMentorship);
  const onWaitingList = openRequest?.status === 'waiting_list' && waitingList;
  const canRequest = !hasCoach && !openRequest;
  const coachName = coach?.profile?.fullName?.trim() || t('mentorship.student.coachNameFallback');
  const isVerifiedCoach = coach?.mentor?.status === 'approved';

  const navItems: MentorshipNavItem[] = (
    hasCoach ? STUDENT_NAV_ITEMS : STUDENT_NAV_ITEMS.filter((item) => item.id === 'dashboard')
  ).map((item) => ({
    ...item,
    label: t(`mentorship.nav.student.${item.id}`),
  }));
  const sectionTitle = t(`mentorship.sections.student.${activeSection}`, {
    defaultValue: t('mentorship.sectionFallback'),
  });
  const isFullHeightSection = activeSection === 'messages';

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        if (canRequest) {
          return (
            <MentorChooser
              onSelect={handleChooseCoach}
              onJoinWaitingList={handleJoinWaitingList}
              isSelecting={isChoosingCoach || isJoiningWaitingList}
              selectingMentorId={selectingMentorId}
            />
          );
        }
        return (
          <View style={styles.sectionBody}>
            {onWaitingList && waitingList ? (
              <WaitingListCard
                status={waitingList}
                onCancel={() => cancelRequest(openRequest?.id)}
                isCancelling={isCancelling}
              />
            ) : null}
            {hasCoach && activeMentorship ? (
              <>
                <MatchedBanner endsAt={activeMentorship.endsAt} />
                <CoachDashboardSummary
                  profile={coach?.profile ?? null}
                  mentor={coach?.mentor ?? null}
                  onViewProfile={() => setActiveSection('coach')}
                />
                <View style={styles.leaveSection}>
                  <Text muted style={styles.leaveHint}>
                    {t('mentorship.student.leaveHint')}
                  </Text>
                  <Button
                    variant="secondary"
                    onPress={handleLeave}
                    loading={isLeaving}
                    textStyle={{ color: colors.error }}
                  >
                    {t('mentorship.student.leave')}
                  </Button>
                </View>
              </>
            ) : null}
            {!hasCoach && !onWaitingList ? (
              <EmptyState
                title={t('mentorship.student.emptyTitle')}
                description={t('mentorship.student.emptyDescription')}
              />
            ) : null}
          </View>
        );

      case 'coach':
        if (!hasCoach) {
          return <Text muted>{t('mentorship.student.chooseToViewProfile')}</Text>;
        }
        return (
          <CoachProfileCard
            profile={coach?.profile ?? null}
            mentor={coach?.mentor ?? null}
            endsAt={activeMentorship?.endsAt}
          />
        );

      case 'messages':
        if (!hasCoach || !mentorshipId) {
          return <Text muted>{t('mentorship.student.chooseToMessage')}</Text>;
        }
        return (
          <MentorshipChat
            messages={messages}
            currentUserId={userId}
            mentorshipId={mentorshipId}
            isLoading={messagesLoading}
            isSending={isSending}
            onSend={sendMessage}
            peerName={coachName}
            peerAvatarUrl={coach?.profile?.avatarUrl}
            fullScreen
            emptyHint={t('mentorship.student.chatEmptyHint')}
          />
        );

      case 'book':
        if (!hasCoach || !mentorshipId || !mentorId) {
          return <Text muted>{t('mentorship.student.chooseToBook')}</Text>;
        }
        return (
          <View style={styles.sectionBody}>
            <StudentBookingCalendar
              coachId={mentorId}
              coachName={coachName}
              mentorshipId={mentorshipId}
              sessions={mySessions}
              onBook={async (input) => {
                await book(input);
              }}
              onCancel={handleCancelSession}
              isBooking={isBooking}
              isLoadingSessions={sessionsLoading}
            />
            {sessionsLoading ? (
              <ActivityIndicator color={mentorshipColors.accent} />
            ) : (
              <SessionsTable
                title={t('mentorship.student.upcomingSessions')}
                sessions={myUpcoming}
                coachName={coachName}
                coachEmail={coach?.profile?.email ?? null}
                isVerifiedMentor={isVerifiedCoach}
                onCancel={handleCancelSession}
              />
            )}
            <SupportContactHint />
          </View>
        );

      case 'sessions':
        if (!hasCoach) {
          return <Text muted>{t('mentorship.student.noSessions')}</Text>;
        }
        if (sessionsLoading) {
          return <ActivityIndicator color={mentorshipColors.accent} />;
        }
        return (
          <SessionsTable
            sessions={myUpcoming}
            coachName={coachName}
            coachEmail={coach?.profile?.email ?? null}
            isVerifiedMentor={isVerifiedCoach}
            onCancel={handleCancelSession}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      <MentorshipShell
        navItems={navItems}
        activeSection={activeSection}
        sectionTitle={sectionTitle}
        onSelectSection={setActiveSection}
        onRefresh={() => void refetch()}
        scrollable={!isFullHeightSection}
        fillWidth={activeSection === 'dashboard' && canRequest}
      >
        {renderSection()}
      </MentorshipShell>

      <Modal
        visible={showLeaveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLeaveModal(false)}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFillObject}
            onPress={() => setShowLeaveModal(false)}
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t('mentorship.student.leaveConfirmTitle')}</Text>
            <Text muted style={styles.modalBody}>
              {t('mentorship.student.leaveConfirmMessage')}
            </Text>
            <View style={styles.reasonWrap}>
              <Text variant="caption" muted>
                {t('mentorship.student.leaveReasonLabel')}
              </Text>
              <TextArea
                value={leaveReason}
                onChangeText={setLeaveReason}
                placeholder={t('mentorship.student.leaveReasonPlaceholder')}
                maxLength={500}
                minHeight={90}
              />
            </View>
            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setShowLeaveModal(false)}>
                {t('mentorship.student.leaveModalCancel')}
              </Button>
              <Button onPress={confirmLeave} loading={isLeaving} textStyle={{ color: colors.error }}>
                {t('mentorship.student.leaveModalSubmit')}
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.md },
  introBody: { fontSize: 14, lineHeight: 20, marginTop: 4 },
  sectionBody: { gap: spacing.md },
  leaveSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  leaveHint: {},
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: mentorshipColors.surfaceElevated,
    borderRadius: 16,
    padding: spacing.lg,
    gap: spacing.md,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: mentorshipColors.text },
  modalBody: { lineHeight: 22 },
  reasonWrap: { gap: spacing.xs },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: spacing.sm },
});
}
