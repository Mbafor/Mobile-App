import { mapMentorshipRow } from '@/services/api/mappers/mentorship.mapper';
import {
  mapAvailabilityRow,
  mapMentorProfileRow,
  mapMessageRow,
  mapParticipantProfileRow,
  mapSessionRow,
} from '@/services/api/mappers/mentorship-extended.mapper';
import { mapMentorshipError, mentorshipErrorFromUnknown } from '@/services/mentorship/errors';
import { supabase } from '@/services/supabase/client';
import type { ApiResult } from '@/types/api';
import type {
  MentorAvailabilityRule,
  MentorProfile,
  MenteeSummary,
  Mentorship,
  MentorshipMessage,
  MentorshipSession,
  MentorshipSessionStatus,
  MentorshipParticipantProfile,
  WaitingListStatus,
} from '@/types/domain/mentorship';
import { estimateWaitLabel } from '@/utils/mentorship/estimate-wait';

function fail<T>(error: { message: string; code?: string }): ApiResult<T> {
  return { success: false, error: mapMentorshipError(error) };
}

function failUnknown<T>(e: unknown): ApiResult<T> {
  return { success: false, error: mentorshipErrorFromUnknown(e) };
}

export const mentorshipDataApi = {
  getApprovedMentorProfile: async (userId: string): Promise<ApiResult<MentorProfile | null>> => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'approved')
        .maybeSingle();

      if (error) return fail(error);
      return { success: true, data: data ? mapMentorProfileRow(data) : null };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getMentorProfile: async (userId: string): Promise<ApiResult<MentorProfile | null>> => {
    try {
      const { data, error } = await supabase
        .from('mentor_profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) return fail(error);
      return { success: true, data: data ? mapMentorProfileRow(data) : null };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getParticipantProfile: async (
    userId: string,
  ): Promise<ApiResult<MentorshipParticipantProfile | null>> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, avatar_url, country, university, course_major, degree_level, interests, career_interests',
        )
        .eq('id', userId)
        .maybeSingle();

      if (error) return fail(error);
      return { success: true, data: data ? mapParticipantProfileRow(data) : null };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listActiveMentees: async (mentorId: string): Promise<ApiResult<MenteeSummary[]>> => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('status', 'active')
        .order('started_at', { ascending: false });

      if (error) return fail(error);

      const mentorships = (data ?? []).map(mapMentorshipRow);
      if (mentorships.length === 0) return { success: true, data: [] };

      const studentIds = mentorships.map((m) => m.studentId);
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, avatar_url, country, university, course_major, degree_level, interests, career_interests',
        )
        .in('id', studentIds);

      if (profileError) return fail(profileError);

      const profileById = new Map(
        (profiles ?? []).map((p) => [p.id, mapParticipantProfileRow(p)]),
      );

      const summaries: MenteeSummary[] = mentorships.map((m) => {
        const progressPercent = computeMentorshipProgress(m);
        return {
          mentorship: m,
          profile: profileById.get(m.studentId) ?? {
            id: m.studentId,
            fullName: null,
            email: null,
            avatarUrl: null,
            country: null,
            university: null,
            courseMajor: null,
            degreeLevel: null,
            interests: [],
            careerInterests: [],
          },
          progressPercent,
        };
      });

      return { success: true, data: summaries };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getWaitingListStatus: async (studentId: string): Promise<ApiResult<WaitingListStatus | null>> => {
    try {
      const { data: entry, error } = await supabase
        .from('mentorship_waiting_list')
        .select('id, request_id, student_id, entered_at, priority')
        .eq('student_id', studentId)
        .maybeSingle();

      if (error) return fail(error);
      if (!entry) return { success: true, data: null };

      const { data: queue, error: queueError } = await supabase
        .from('mentorship_waiting_list')
        .select('student_id, entered_at, priority')
        .order('priority', { ascending: false })
        .order('entered_at', { ascending: true });

      if (queueError) return fail(queueError);

      const ordered = queue ?? [];
      const position =
        ordered.findIndex((row) => row.student_id === studentId) + 1 || 1;
      const total = ordered.length || 1;

      return {
        success: true,
        data: {
          requestId: entry.request_id,
          position,
          totalInQueue: total,
          estimatedWaitLabel: estimateWaitLabel(position),
          enteredAt: entry.entered_at,
        },
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listAvailability: async (mentorId: string): Promise<ApiResult<MentorAvailabilityRule[]>> => {
    try {
      const { data, error } = await supabase
        .from('mentor_availability_rules')
        .select('*')
        .eq('mentor_id', mentorId)
        .eq('is_active', true)
        .order('day_of_week')
        .order('start_time');

      if (error) return fail(error);
      return { success: true, data: (data ?? []).map(mapAvailabilityRow) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  upsertAvailabilityRule: async (
    mentorId: string,
    rule: Omit<MentorAvailabilityRule, 'id' | 'mentorId'> & { id?: string },
  ): Promise<ApiResult<MentorAvailabilityRule>> => {
    try {
      const payload = {
        mentor_id: mentorId,
        day_of_week: rule.dayOfWeek,
        start_time: rule.startTime,
        end_time: rule.endTime,
        timezone: rule.timezone,
        is_active: rule.isActive,
      };

      if (rule.id) {
        const { data, error } = await supabase
          .from('mentor_availability_rules')
          .update(payload)
          .eq('id', rule.id)
          .eq('mentor_id', mentorId)
          .select('*')
          .single();
        if (error) return fail(error);
        return { success: true, data: mapAvailabilityRow(data) };
      }

      const { data, error } = await supabase
        .from('mentor_availability_rules')
        .insert(payload)
        .select('*')
        .single();

      if (error) return fail(error);
      return { success: true, data: mapAvailabilityRow(data) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  deleteAvailabilityRule: async (mentorId: string, ruleId: string): Promise<ApiResult<null>> => {
    try {
      const { error } = await supabase
        .from('mentor_availability_rules')
        .delete()
        .eq('id', ruleId)
        .eq('mentor_id', mentorId);

      if (error) return fail(error);
      return { success: true, data: null };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listSessionsForUser: async (userId: string): Promise<ApiResult<MentorshipSession[]>> => {
    try {
      const { data: memberships, error: mError } = await supabase
        .from('mentorships')
        .select('id')
        .or(`student_id.eq.${userId},mentor_id.eq.${userId}`);

      if (mError) return fail(mError);

      const ids = (memberships ?? []).map((m) => m.id);
      if (ids.length === 0) return { success: true, data: [] };

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .select('*')
        .in('mentorship_id', ids)
        .order('scheduled_start', { ascending: true });

      if (error) return fail(error);
      return { success: true, data: (data ?? []).map(mapSessionRow) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  bookSession: async (input: {
    mentorshipId: string;
    createdBy: string;
    scheduledStart: string;
    scheduledEnd: string;
    timezone: string;
    title?: string;
    notes?: string;
    meetingUrl?: string;
  }): Promise<ApiResult<MentorshipSession>> => {
    try {
      const { data, error } = await supabase
        .from('mentorship_sessions')
        .insert({
          mentorship_id: input.mentorshipId,
          created_by: input.createdBy,
          scheduled_start: input.scheduledStart,
          scheduled_end: input.scheduledEnd,
          timezone: input.timezone,
          status: 'proposed',
          title: input.title ?? 'Mentorship session',
          notes: input.notes ?? null,
          meeting_url: input.meetingUrl ?? null,
        })
        .select('*')
        .single();

      if (error) return fail(error);
      return { success: true, data: mapSessionRow(data) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  updateSession: async (
    sessionId: string,
    updates: {
      status?: MentorshipSessionStatus;
      scheduledStart?: string;
      scheduledEnd?: string;
      title?: string;
      notes?: string;
      meetingUrl?: string;
      cancelReason?: string;
    },
  ): Promise<ApiResult<MentorshipSession>> => {
    try {
      const payload: Record<string, unknown> = {};
      if (updates.status) payload.status = updates.status;
      if (updates.scheduledStart) payload.scheduled_start = updates.scheduledStart;
      if (updates.scheduledEnd) payload.scheduled_end = updates.scheduledEnd;
      if (updates.title !== undefined) payload.title = updates.title;
      if (updates.notes !== undefined) payload.notes = updates.notes;
      if (updates.meetingUrl !== undefined) payload.meeting_url = updates.meetingUrl;
      if (updates.status === 'cancelled') {
        payload.cancelled_at = new Date().toISOString();
        payload.cancel_reason = updates.cancelReason ?? 'Cancelled';
      }

      const { data, error } = await supabase
        .from('mentorship_sessions')
        .update(payload)
        .eq('id', sessionId)
        .select('*')
        .single();

      if (error) return fail(error);
      return { success: true, data: mapSessionRow(data) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getLastMessage: async (
    mentorshipId: string,
  ): Promise<ApiResult<MentorshipMessage | null>> => {
    try {
      const { data, error } = await supabase
        .from('mentorship_messages')
        .select('*')
        .eq('mentorship_id', mentorshipId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return fail(error);
      return { success: true, data: data ? mapMessageRow(data) : null };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listMessages: async (mentorshipId: string): Promise<ApiResult<MentorshipMessage[]>> => {
    try {
      const { data, error } = await supabase
        .from('mentorship_messages')
        .select('*')
        .eq('mentorship_id', mentorshipId)
        .order('created_at', { ascending: true });

      if (error) return fail(error);
      return { success: true, data: (data ?? []).map(mapMessageRow) };
    } catch (e) {
      return failUnknown(e);
    }
  },

  sendMessage: async (
    mentorshipId: string,
    senderId: string,
    body: string,
    options?: {
      attachmentUrl?: string | null;
      attachmentType?: 'image' | 'file' | null;
    },
  ): Promise<ApiResult<MentorshipMessage>> => {
    try {
      const trimmed = body.trim();
      const attachmentUrl = options?.attachmentUrl ?? null;
      if (!trimmed && !attachmentUrl) {
        return { success: false, error: { code: 'validation', message: 'Message cannot be empty.' } };
      }

      const { data, error } = await supabase
        .from('mentorship_messages')
        .insert({
          mentorship_id: mentorshipId,
          sender_id: senderId,
          body: trimmed || (options?.attachmentType === 'image' ? 'Photo' : 'Attachment'),
          attachment_url: attachmentUrl,
          attachment_type: options?.attachmentType ?? null,
        })
        .select('*')
        .single();

      if (error) return fail(error);
      return { success: true, data: mapMessageRow(data) };
    } catch (e) {
      return failUnknown(e);
    }
  },
};

function computeMentorshipProgress(m: Mentorship): number {
  const start = new Date(m.startedAt).getTime();
  const end = new Date(m.endsAt).getTime();
  const now = Date.now();
  if (end <= start) return 100;
  const pct = ((now - start) / (end - start)) * 100;
  return Math.min(100, Math.max(0, Math.round(pct)));
}
