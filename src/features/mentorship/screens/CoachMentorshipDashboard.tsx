import { useQueryClient } from '@tanstack/react-query';
import { useTheme } from '@/hooks/useTheme';
import type { AppTheme } from '@/constants/theme/types';
import { useAppThemedStyles } from '@/hooks/useAppThemedStyles';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { MentorshipNavItem } from '@/features/mentorship/components/shared/MentorshipDrawerNav';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { CoachSchedulingCalendar } from '@/features/mentorship/components/calendar/CoachSchedulingCalendar';
import { UpcomingSessionsPanel } from '@/features/mentorship/components/calendar/UpcomingSessionsPanel';
import { CapacityBadge } from '@/features/mentorship/components/coach/CapacityBadge';
import { CoachMessagesView } from '@/features/mentorship/components/coach/CoachMessagesView';
import { CoachNotificationsPanel } from '@/features/mentorship/components/coach/CoachNotificationsPanel';
import { CoachSessionsTable } from '@/features/mentorship/components/coach/CoachSessionsTable';
import { MenteesTable } from '@/features/mentorship/components/coach/MenteesTable';
import { MentorshipShell } from '@/features/mentorship/components/shared/MentorshipShell';
import { COACH_NAV_ITEMS } from '@/features/mentorship/constants/nav-items';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCoachMentorship } from '@/features/mentorship/hooks/useCoachMentorship';
import { useMentorshipSchedulingRealtime } from '@/features/mentorship/hooks/useMentorshipSchedulingRealtime';
import { useMentorshipActions } from '@/features/mentorship/hooks/useMentorshipActions';
import { useCoachThreadPreviews } from '@/features/mentorship/hooks/useCoachThreadPreviews';
import {
  useMentorshipSessions,
  useSessionMutations,
} from '@/features/mentorship/hooks/useMentorshipSessions';
import { queryKeys } from '@/constants/query-keys';
import { mentorshipSchedulingApi } from '@/services/api';
import { spacing } from '@/constants/theme';
import { confirmAction } from '@/utils/confirm-action';

export function CoachMentorshipDashboard() {
  const styles = useAppThemedStyles(createStyles);
  const { mentorshipColors } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [chatMentorshipId, setChatMentorshipId] = useState<string | undefined>(undefined);
  const [showCompletedSessions, setShowCompletedSessions] = useState(true);

  const { mentees, capacity, isLoading, error, refetch } = useCoachMentorship();
  const { removeMentee, isRemoving } = useMentorshipActions();
  const { completed, sessions, isLoading: sessionsLoading } = useMentorshipSessions(userId);
  const { update, cancel, confirm } = useSessionMutations(userId);
  useMentorshipSchedulingRealtime(userId);

  const mentorshipIds = mentees.map((m) => m.mentorship.id);
  const { previewsByMentorshipId } = useCoachThreadPreviews(
    activeSection === 'notifications' ? mentorshipIds : [],
  );

  const messagesByMentorship = Object.fromEntries(
    Object.entries(previewsByMentorshipId).map(([id, msg]) => [id, msg ? [msg] : []]),
  );

  const navItems: MentorshipNavItem[] = COACH_NAV_ITEMS.map((item) => ({
    ...item,
    label: t(`mentorship.nav.coach.${item.id}`),
  }));
  const sectionTitle = t(`mentorship.sections.coach.${activeSection}`, {
    defaultValue: t('mentorship.sectionFallback'),
  });
  const isFullHeightSection = activeSection === 'messages';

  const handleConfirmSession = async (sessionId: string) => {
    try {
      const ok = await confirmAction(
        t('mentorship.coach.confirmSessionTitle'),
        t('mentorship.coach.confirmSessionMessage'),
      );
      if (!ok) return;
      await confirm(sessionId);
      Alert.alert(t('mentorship.coach.sessionConfirmedTitle'), t('mentorship.coach.sessionConfirmedMessage'));
      void queryClient.invalidateQueries({ queryKey: ['mentorship', 'sessions'] });
    } catch (e) {
      Alert.alert(t('mentorship.coach.errorTitle'), e instanceof Error ? e.message : t('mentorship.coach.confirmSessionError'));
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    const ok = await confirmAction(
      t('mentorship.coach.cancelSessionTitle'),
      t('mentorship.coach.cancelSessionMessage'),
    );
    if (!ok) return;
    void cancel(sessionId, 'Cancelled by coach').catch((e: Error) => Alert.alert(t('mentorship.coach.errorTitle'), e.message));
  };

  const handleSetMeetingUrl = async (sessionId: string, url: string) => {
    await update(sessionId, { meetingUrl: url, status: 'confirmed' });
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
      </View>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <View style={styles.sectionBody}>
            {capacity ? (
              <CapacityBadge
                activeCount={capacity.activeCount}
                maxStudents={capacity.maxStudents}
              />
            ) : null}
            <MenteesTable
              mentees={mentees}
              onRemove={(id) => removeMentee({ mentorshipId: id, reason: 'Removed by coach' })}
              isRemoving={isRemoving}
              onMessage={(id) => {
                setChatMentorshipId(id);
                setActiveSection('messages');
              }}
            />
          </View>
        );

      case 'messages':
        return (
          <CoachMessagesView
            mentees={mentees}
            currentUserId={userId}
            initialActiveMentorshipId={chatMentorshipId}
          />
        );

      case 'availability':
        return (
          <View style={styles.sectionBody}>
            <CoachSchedulingCalendar
              coachId={userId}
              sessions={sessions}
              isLoadingSessions={sessionsLoading}
            />
            <UpcomingSessionsPanel
              sessions={sessions}
              role="coach"
              getPeerName={(session) => {
                const mentee = mentees.find((m) => m.mentorship.id === session.mentorshipId);
                return mentee?.profile.fullName?.trim() || t('mentorship.coach.studentFallback');
              }}
              onConfirm={handleConfirmSession}
              onCancel={handleCancelSession}
            />
          </View>
        );

      case 'sessions':
        if (sessionsLoading) {
          return <ActivityIndicator color={mentorshipColors.accent} />;
        }
        return (
          <View style={styles.sectionBody}>
            <CoachSessionsTable
              title={t('mentorship.coach.upcoming')}
              isCompleted={false}
              sessions={sessions.filter(
                (s) => s.status !== 'cancelled' && s.status !== 'completed',
              )}
              getMenteeDetails={(session) => {
                const mentee = mentees.find((m) => m.mentorship.id === session.mentorshipId);
                return {
                  name: mentee?.profile.fullName?.trim() || t('mentorship.coach.menteeFallback'),
                  email: mentee?.profile.email ?? null,
                };
              }}
              onConfirm={handleConfirmSession}
              onCancel={handleCancelSession}
              onSetMeetingUrl={handleSetMeetingUrl}
            />
            <View style={styles.completedToggleRow}>
              <Text style={styles.completedToggleTitle}>{t('mentorship.coach.completed')}</Text>
              <Pressable
                hitSlop={10}
                style={styles.completedToggleBtn}
                onPress={() => setShowCompletedSessions((v) => !v)}
                accessibilityLabel={t('mentorship.coach.toggleCompleted')}
              >
                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={mentorshipColors.textMuted}
                  style={{
                    transform: [
                      { rotate: showCompletedSessions ? '0deg' : '180deg' },
                    ],
                  }}
                />
              </Pressable>
            </View>
            {showCompletedSessions ? (
              <CoachSessionsTable
                sessions={completed}
                isCompleted
                getMenteeDetails={(session) => {
                  const mentee = mentees.find((m) => m.mentorship.id === session.mentorshipId);
                  return {
                    name: mentee?.profile.fullName?.trim() || t('mentorship.coach.menteeFallback'),
                    email: mentee?.profile.email ?? null,
                  };
                }}
              />
            ) : null}
          </View>
        );

      case 'notifications':
        return (
          <CoachNotificationsPanel
            mentees={mentees}
            sessions={sessions}
            messagesByMentorship={messagesByMentorship}
            currentUserId={userId}
          />
        );

      default:
        return null;
    }
  };

  return (
    <MentorshipShell
      navItems={navItems}
      activeSection={activeSection}
      sectionTitle={sectionTitle}
      onSelectSection={setActiveSection}
      onRefresh={() => void refetch()}
      scrollable={!isFullHeightSection}
    >
      {renderSection()}
    </MentorshipShell>
  );
}

function createStyles(theme: AppTheme) {
  const { colors, mentorshipColors, cvDocsTheme } = theme;
  return StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  sectionBody: { gap: spacing.md },
  completedToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: mentorshipColors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: mentorshipColors.border,
    borderRadius: 12,
  },
  completedToggleTitle: { fontSize: 16, fontWeight: '700', color: mentorshipColors.text },
  completedToggleBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
});
}
