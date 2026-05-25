import {
  mapMentorshipRequestRow,
  mapMentorshipRow,
} from '@/services/api/mappers/mentorship.mapper';
import { mapMentorshipError, mentorshipErrorFromUnknown } from '@/services/mentorship/errors';
import {
  parseCancelRequestResult,
  parseEndMentorshipResult,
  parseMaintenanceResult,
  parseRequestCoachResult,
} from '@/services/mentorship/parse-rpc';
import {
  validateEndReason,
  validateEndStatus,
  validateMentorshipId,
  validateRequestId,
  validateRequestedMentorId,
} from '@/services/mentorship/validation';
import { supabase } from '@/services/supabase/client';
import type { ApiResult } from '@/types/api';
import type {
  CancelRequestResult,
  EndMentorshipResult,
  Mentorship,
  MentorshipMaintenanceResult,
  MentorshipRequest,
  MentorshipStatus,
  RequestCoachResult,
} from '@/types/domain/mentorship';

function fail<T>(error: { message: string; code?: string }): ApiResult<T> {
  return { success: false, error: mapMentorshipError(error) };
}

function failUnknown<T>(e: unknown): ApiResult<T> {
  return { success: false, error: mentorshipErrorFromUnknown(e) };
}

export const mentorshipApi = {
  /**
   * Student taps "Request a Coach" — matches by major/interests/career goals,
   * assigns immediately if a compatible coach has capacity, otherwise waiting list.
   */
  requestCoach: async (
    requestedMentorId?: string | null,
  ): Promise<ApiResult<RequestCoachResult>> => {
    const mentorValidation = validateRequestedMentorId(requestedMentorId);
    if (mentorValidation) {
      return { success: false, error: { code: 'validation', message: mentorValidation } };
    }

    try {
      const { data, error } = await supabase.rpc('request_mentorship_coach', {
        p_requested_mentor_id: requestedMentorId ?? undefined,
      });

      if (error) return fail(error);
      const parsed = parseRequestCoachResult(data);
      if (!parsed) {
        return {
          success: false,
          error: { code: 'parse', message: 'Unexpected response from server.' },
        };
      }
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  cancelRequest: async (requestId?: string): Promise<ApiResult<CancelRequestResult>> => {
    if (requestId) {
      const validation = validateRequestId(requestId);
      if (validation) {
        return { success: false, error: { code: 'validation', message: validation } };
      }
    }

    try {
      const { data, error } = await supabase.rpc('cancel_mentorship_request', {
        p_request_id: requestId,
      });

      if (error) return fail(error);
      const parsed = parseCancelRequestResult(data);
      if (!parsed) {
        return {
          success: false,
          error: { code: 'parse', message: 'Unexpected response from server.' },
        };
      }
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  /** Student voluntarily leaves an active mentorship. */
  leaveMentorship: async (
    mentorshipId: string,
    reason?: string,
  ): Promise<ApiResult<EndMentorshipResult>> => {
    return mentorshipApi.endMentorship(mentorshipId, 'left_by_student', reason);
  },

  /** Coach removes an inactive (or any) student from active mentorship. */
  removeMentee: async (
    mentorshipId: string,
    reason?: string,
  ): Promise<ApiResult<EndMentorshipResult>> => {
    return mentorshipApi.endMentorship(mentorshipId, 'removed_by_mentor', reason);
  },

  endMentorship: async (
    mentorshipId: string,
    status: MentorshipStatus,
    reason?: string,
  ): Promise<ApiResult<EndMentorshipResult>> => {
    const idError = validateMentorshipId(mentorshipId);
    if (idError) {
      return { success: false, error: { code: 'validation', message: idError } };
    }
    if (!validateEndStatus(status)) {
      return {
        success: false,
        error: { code: 'validation', message: 'Invalid mentorship end status.' },
      };
    }
    const reasonError = validateEndReason(reason);
    if (reasonError) {
      return { success: false, error: { code: 'validation', message: reasonError } };
    }

    try {
      const { data, error } = await supabase.rpc('end_mentorship', {
        p_mentorship_id: mentorshipId,
        p_status: status,
        p_reason: reason?.trim() || undefined,
      });

      if (error) return fail(error);
      const parsed = parseEndMentorshipResult(data);
      if (!parsed) {
        return {
          success: false,
          error: { code: 'parse', message: 'Unexpected response from server.' },
        };
      }
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getActiveMentorship: async (userId: string): Promise<ApiResult<Mentorship | null>> => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .eq('status', 'active')
        .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
        .maybeSingle();

      if (error) return fail(error);
      return {
        success: true,
        data: data ? mapMentorshipRow(data) : null,
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getOpenRequest: async (studentId: string): Promise<ApiResult<MentorshipRequest | null>> => {
    try {
      const { data, error } = await supabase
        .from('mentorship_requests')
        .select('*')
        .eq('student_id', studentId)
        .in('status', ['pending', 'waiting_list'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) return fail(error);
      return {
        success: true,
        data: data ? mapMentorshipRequestRow(data) : null,
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listMentorships: async (userId: string): Promise<ApiResult<Mentorship[]>> => {
    try {
      const { data, error } = await supabase
        .from('mentorships')
        .select('*')
        .or(`student_id.eq.${userId},mentor_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) return fail(error);
      return {
        success: true,
        data: (data ?? []).map(mapMentorshipRow),
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  getMentorCapacity: async (mentorId: string): Promise<
    ApiResult<{ activeCount: number; maxStudents: number; hasCapacity: boolean }>
  > => {
    try {
      const [{ data: count, error: countError }, { data: profile, error: profileError }] =
        await Promise.all([
          supabase.rpc('mentor_active_mentee_count', { p_mentor_id: mentorId }),
          supabase
            .from('mentor_profiles')
            .select('max_students')
            .eq('user_id', mentorId)
            .eq('status', 'approved')
            .maybeSingle(),
        ]);

      if (countError) return fail(countError);
      if (profileError) return fail(profileError);

      const maxStudents = profile?.max_students ?? 10;
      const activeCount = Number(count ?? 0);

      return {
        success: true,
        data: {
          activeCount,
          maxStudents,
          hasCapacity: activeCount < maxStudents,
        },
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  /**
   * Cron-only: invokes edge function with service auth.
   * Not for client use in production unless CRON_SECRET is configured.
   */
  runMaintenance: async (): Promise<ApiResult<MentorshipMaintenanceResult>> => {
    try {
      const { data, error } = await supabase.functions.invoke('mentorship-maintenance', {
        method: 'POST',
      });

      if (error) return fail(error);

      const body = data as { result?: unknown; error?: string } | null;
      if (body?.error) {
        return { success: false, error: { code: 'edge', message: body.error } };
      }

      const parsed = parseMaintenanceResult(body?.result ?? body);
      if (!parsed) {
        return {
          success: false,
          error: { code: 'parse', message: 'Unexpected maintenance response.' },
        };
      }
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },
};
