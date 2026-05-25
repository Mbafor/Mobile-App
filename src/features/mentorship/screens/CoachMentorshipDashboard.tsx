import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  View,
} from 'react-native';

import { ErrorMessage } from '@/components/feedback';
import { Text } from '@/components/ui';
import { AvailabilityManager } from '@/features/mentorship/components/coach/AvailabilityManager';
import { CapacityBadge } from '@/features/mentorship/components/coach/CapacityBadge';
import { CoachMessagesView } from '@/features/mentorship/components/coach/CoachMessagesView';
import { CoachNotificationsPanel } from '@/features/mentorship/components/coach/CoachNotificationsPanel';
import { CoachSessionsTable } from '@/features/mentorship/components/coach/CoachSessionsTable';
import { MenteesTable } from '@/features/mentorship/components/coach/MenteesTable';
import { MentorshipShell } from '@/features/mentorship/components/shared/MentorshipShell';
import {
  COACH_NAV_ITEMS,
  COACH_SECTION_TITLES,
} from '@/features/mentorship/constants/nav-items';
import { mentorshipColors } from '@/features/mentorship/constants/theme';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useCoachMentorship } from '@/features/mentorship/hooks/useCoachMentorship';
import { useMentorAvailability } from '@/features/mentorship/hooks/useMentorAvailability';
import { useMentorshipActions } from '@/features/mentorship/hooks/useMentorshipActions';
import { useCoachThreadPreviews } from '@/features/mentorship/hooks/useCoachThreadPreviews';
import {
  useMentorshipSessions,
  useSessionMutations,
} from '@/features/mentorship/hooks/useMentorshipSessions';
import { spacing } from '@/constants/theme';

export function CoachMentorshipDashboard() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const [activeSection, setActiveSection] = useState('dashboard');

  const { mentees, capacity, isLoading, error, refetch } = useCoachMentorship();
  const { removeMentee, isRemoving } = useMentorshipActions();
  const { rules, saveRule, deleteRule, isSaving, isDeleting } = useMentorAvailability(userId);
  const { completed, sessions, isLoading: sessionsLoading } = useMentorshipSessions(userId);
  const { update } = useSessionMutations(userId);

  const mentorshipIds = mentees.map((m) => m.mentorship.id);
  const { previewsByMentorshipId } = useCoachThreadPreviews(
    activeSection === 'notifications' ? mentorshipIds : [],
  );

  const messagesByMentorship = Object.fromEntries(
    Object.entries(previewsByMentorshipId).map(([id, msg]) => [id, msg ? [msg] : []]),
  );

  const sectionTitle = COACH_SECTION_TITLES[activeSection] ?? 'Mentorship';
  const isFullHeightSection = activeSection === 'messages';

  const handleConfirmSession = (sessionId: string) => {
    void update(sessionId, { status: 'confirmed' }).catch((e: Error) =>
      Alert.alert('Error', e.message),
    );
  };

  const handleCancelSession = (sessionId: string) => {
    void update(sessionId, {
      status: 'cancelled',
      cancelReason: 'Cancelled by coach',
    }).catch((e: Error) => Alert.alert('Error', e.message));
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
        <ErrorMessage message={error instanceof Error ? error.message : 'Failed to load'} />
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
            />
          </View>
        );

      case 'messages':
        return <CoachMessagesView mentees={mentees} currentUserId={userId} />;

      case 'availability':
        return (
          <AvailabilityManager
            rules={rules}
            onSave={(rule) => saveRule(rule)}
            onDelete={deleteRule}
            isSaving={isSaving || isDeleting}
          />
        );

      case 'sessions':
        if (sessionsLoading) {
          return <ActivityIndicator color={mentorshipColors.accent} />;
        }
        return (
          <View style={styles.sectionBody}>
            <CoachSessionsTable
              title="Upcoming"
              sessions={sessions.filter(
                (s) => s.status !== 'cancelled' && s.status !== 'completed',
              )}
              onConfirm={handleConfirmSession}
              onCancel={handleCancelSession}
              onSetMeetingUrl={handleSetMeetingUrl}
            />
            <CoachSessionsTable title="Completed" sessions={completed} />
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
      navItems={COACH_NAV_ITEMS}
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

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', padding: spacing.lg },
  sectionBody: { gap: spacing.md },
});
