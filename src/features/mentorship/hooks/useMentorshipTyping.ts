import { useCallback, useEffect, useRef, useState } from 'react';

import { supabase } from '@/services/supabase/client';

type TypingPayload = {
  userId: string;
  isTyping: boolean;
};

export function useMentorshipTyping(
  mentorshipId: string | undefined,
  currentUserId: string,
  enabled = true,
) {
  const [peerTyping, setPeerTyping] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSentRef = useRef(false);

  useEffect(() => {
    if (!mentorshipId || !enabled) {
      setPeerTyping(false);
      return;
    }

    const channel = supabase.channel(`mentorship-typing:${mentorshipId}`, {
      config: { broadcast: { self: false } },
    });

    channel.on('broadcast', { event: 'typing' }, ({ payload }) => {
      const data = payload as TypingPayload;
      if (data.userId && data.userId !== currentUserId) {
        setPeerTyping(Boolean(data.isTyping));
      }
    });

    channel.subscribe();
    channelRef.current = channel;

    return () => {
      setPeerTyping(false);
      channelRef.current = null;
      void supabase.removeChannel(channel);
    };
  }, [mentorshipId, currentUserId, enabled]);

  const broadcastTyping = useCallback(
    (isTyping: boolean) => {
      const channel = channelRef.current;
      if (!channel || !mentorshipId) return;
      if (lastSentRef.current === isTyping && isTyping) return;
      lastSentRef.current = isTyping;
      void channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, isTyping } satisfies TypingPayload,
      });
    },
    [mentorshipId, currentUserId],
  );

  const onDraftChange = useCallback(
    (text: string) => {
      if (stopTimerRef.current) clearTimeout(stopTimerRef.current);
      const hasText = text.trim().length > 0;
      if (hasText) broadcastTyping(true);
      stopTimerRef.current = setTimeout(() => broadcastTyping(false), 1200);
    },
    [broadcastTyping],
  );

  return { peerTyping, onDraftChange };
}
