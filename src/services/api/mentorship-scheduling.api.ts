import { mapAvailabilitySlotRow, mapSessionRow } from '@/services/api/mappers/mentorship-extended.mapper';
import { mapMentorshipError, mentorshipErrorFromUnknown } from '@/services/mentorship/errors';
import { supabase } from '@/services/supabase/client';
import type { ApiResult } from '@/types/api';
import type { AvailabilitySlot, MentorshipSession } from '@/types/domain/mentorship';

function fail<T>(error: { message: string; code?: string }): ApiResult<T> {
  return { success: false, error: mapMentorshipError(error) };
}

function failUnknown<T>(e: unknown): ApiResult<T> {
  return { success: false, error: mentorshipErrorFromUnknown(e) };
}

export const mentorshipSchedulingApi = {
  listAvailabilitySlots: async (coachId: string): Promise<ApiResult<AvailabilitySlot[]>> => {
    try {
      const { data, error } = await supabase
        .from('availability_slots')
        .select('*')
        .eq('coach_id', coachId)
        .order('day_of_week')
        .order('start_time');

      if (error) return fail(error);
      return { success: true, data: (data ?? []).map(mapAvailabilitySlotRow) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  toggleAvailabilitySlot: async (input: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone?: string;
  }): Promise<ApiResult<{ action: 'added' | 'removed'; id: string }>> => {
    try {
      const { data, error } = await supabase.rpc('toggle_availability_slot', {
        p_day_of_week: input.dayOfWeek,
        p_start_time: input.startTime,
        p_end_time: input.endTime,
        p_timezone: input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
      });

      if (error) return fail(error);
      const row = data as { action: string; id: string };
      return {
        success: true,
        data: { action: row.action as 'added' | 'removed', id: row.id },
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  bookSession: async (input: {
    mentorshipId: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    title?: string;
    notes?: string;
  }): Promise<ApiResult<MentorshipSession>> => {
    try {
      const { data, error } = await supabase.rpc('book_mentorship_session', {
        p_mentorship_id: input.mentorshipId,
        p_scheduled_start: input.scheduledStart,
        p_scheduled_end: input.scheduledEnd,
        p_timezone: input.timezone,
        p_title: input.title ?? 'Mentorship session',
        p_notes: input.notes ?? null,
      });

      if (error) return fail(error);
      return { success: true, data: mapSessionRow(data as Parameters<typeof mapSessionRow>[0]) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  cancelSession: async (
    sessionId: string,
    reason?: string,
  ): Promise<ApiResult<MentorshipSession>> => {
    try {
      const { data, error } = await supabase.rpc('cancel_mentorship_session', {
        p_session_id: sessionId,
        p_reason: reason ?? 'Cancelled',
      });

      if (error) return fail(error);
      return {
        success: true,
        data: mapSessionRow(data as Parameters<typeof mapSessionRow>[0]),
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  completePastSessions: async (): Promise<ApiResult<number>> => {
    try {
      const { data, error } = await supabase.rpc('complete_past_mentorship_sessions');
      if (error) return fail(error);
      return { success: true, data: (data as number) ?? 0 };
    } catch (e) {
      return failUnknown(e);
    }
  },

  confirmSession: async (
    sessionId: string,
    meetingUrl?: string | null,
  ): Promise<ApiResult<MentorshipSession>> => {
    try {
      const { data, error } = await supabase.rpc('confirm_mentorship_session', {
        p_session_id: sessionId,
        p_meeting_url: meetingUrl ?? null,
      });

      if (error) return fail(error);
      return { success: true, data: mapSessionRow(data as Parameters<typeof mapSessionRow>[0]) };
    } catch (e) {
      return failUnknown(e);
    }
  },
};
