import { useQueries } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { mentorshipDataApi } from '@/services/api';
import type { MentorshipMessage } from '@/types/domain/mentorship';

export function useCoachThreadPreviews(mentorshipIds: string[]) {
  const queries = useQueries({
    queries: mentorshipIds.map((id) => ({
      queryKey: queryKeys.mentorship.messagePreview(id),
      queryFn: async () => {
        const result = await mentorshipDataApi.getLastMessage(id);
        if (!result.success) throw new Error(result.error.message);
        return result.data;
      },
      enabled: Boolean(id),
      staleTime: 30_000,
    })),
  });

  const previewsByMentorshipId: Record<string, MentorshipMessage | null> = {};
  mentorshipIds.forEach((id, i) => {
    previewsByMentorshipId[id] = queries[i]?.data ?? null;
  });

  return {
    previewsByMentorshipId,
    isLoading: queries.some((q) => q.isLoading),
  };
}
