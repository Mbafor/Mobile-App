import { MentorshipMobileList } from '@/features/mentorship/components/shared/MentorshipMobileList';
import { SessionManageCard } from '@/features/mentorship/components/shared/SessionManageCard';
import type { MentorshipSession } from '@/types/domain/mentorship';

type SessionsTableProps = {
  sessions: MentorshipSession[];
  coachName: string;
  onCancel?: (sessionId: string) => void;
};

export function SessionsTable({ sessions, coachName, onCancel }: SessionsTableProps) {
  return (
    <MentorshipMobileList
      data={sessions}
      keyExtractor={(s) => s.id}
      emptyMessage="No upcoming sessions scheduled."
      renderCard={(session) => (
        <SessionManageCard
          session={session}
          role="mentee"
          coachName={coachName}
          onCancel={onCancel}
        />
      )}
    />
  );
}
