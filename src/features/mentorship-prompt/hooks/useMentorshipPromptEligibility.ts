import { useEffect, useRef } from 'react';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipPromptApi } from '@/features/mentorship-prompt/services/mentorship-prompt.api';
import { useMentorshipPromptStore } from '@/features/mentorship-prompt/store/mentorship-prompt.store';

/**
 * Call once from the Dashboard screen. Opens the "join mentorship" prompt
 * exactly once ever per user (new or already-existing), then marks it seen
 * immediately -- before the user even acts on it -- so however they dismiss
 * it (button, backdrop tap, back button, closing the app) it never reappears.
 */
export function useMentorshipPromptEligibility() {
  const { user } = useAuth();
  const open = useMentorshipPromptStore((s) => s.open);
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    if (!user) return;
    checkedRef.current = true;

    void (async () => {
      const { seen, error } = await mentorshipPromptApi.getPromptStatus(user.id);
      if (error || seen) return;
      open();
      void mentorshipPromptApi.markPromptSeen(user.id);
    })();
  }, [user, open]);
}
