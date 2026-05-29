import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';

import { supabase } from '@/services/supabase/client';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { maxBytesForType } from '@/features/mentorship/utils/pick-mentorship-attachment';
import { mentorshipDataApi } from '@/services/api';
import { mentorshipAttachmentApi } from '@/services/api/mentorship-attachment.api';
import type { MentorshipMessageAttachmentType } from '@/types/domain/mentorship';

export type SendMessageInput = {
  body?: string;
  localAttachmentUri?: string;
  attachmentType?: MentorshipMessageAttachmentType;
  fileName?: string;
  mimeType?: string;
};

export function useMentorshipMessages(
  mentorshipId: string | undefined,
  options?: { enabled?: boolean; poll?: boolean },
) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const enabled = options?.enabled !== false && Boolean(mentorshipId);
  const poll = options?.poll ?? false;

  const messagesQuery = useQuery({
    queryKey: queryKeys.mentorship.messages(mentorshipId ?? ''),
    queryFn: async () => {
      if (!mentorshipId) return [];
      const result = await mentorshipDataApi.listMessages(mentorshipId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled,
    refetchInterval: poll && enabled ? 4000 : false,
  });

  // Realtime: invalidate messages whenever a new row lands in this mentorship thread,
  // regardless of which tab the user is on.
  useEffect(() => {
    if (!mentorshipId) return;
    const channel = supabase
      .channel(`mentorship-messages:${mentorshipId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mentorship_messages',
          filter: `mentorship_id=eq.${mentorshipId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.mentorship.messages(mentorshipId),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.mentorship.messagePreview(mentorshipId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [mentorshipId, queryClient]);

  const sendMutation = useMutation({
    mutationFn: async (input: SendMessageInput | string) => {
      if (!mentorshipId || !userId) throw new Error('Not signed in');

      const payload = typeof input === 'string' ? { body: input } : input;
      let attachmentUrl: string | null = null;
      let attachmentType: MentorshipMessageAttachmentType | null =
        payload.attachmentType ?? null;
      let displayBody = payload.body?.trim() ?? '';

      if (payload.localAttachmentUri) {
        const type = attachmentType ?? 'image';
        const upload = await mentorshipAttachmentApi.uploadFromUri({
          userId,
          mentorshipId,
          localUri: payload.localAttachmentUri,
          attachmentType: type,
          fileName: payload.fileName,
          mimeType: payload.mimeType,
          maxBytes: maxBytesForType(type),
        });
        if (!upload.publicUrl) {
          throw upload.error ?? new Error('Failed to upload attachment');
        }
        attachmentUrl = upload.publicUrl;
        attachmentType = type;
        if (!displayBody) {
          displayBody =
            type === 'image' ? 'Photo' : `📎 ${upload.fileName}`;
        }
      }

      if (!displayBody && !attachmentUrl) {
        throw new Error('Message cannot be empty.');
      }

      const result = await mentorshipDataApi.sendMessage(mentorshipId, userId, displayBody, {
        attachmentUrl,
        attachmentType,
      });
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.mentorship.messages(mentorshipId ?? ''),
      });
      if (mentorshipId) {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.mentorship.messagePreview(mentorshipId),
        });
      }
    },
  });

  const sendMessage = useCallback(
    async (input: SendMessageInput | string) => {
      await sendMutation.mutateAsync(input);
    },
    [sendMutation],
  );

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error ?? sendMutation.error,
    sendMessage,
    isSending: sendMutation.isPending,
    sendError: sendMutation.error,
  };
}
