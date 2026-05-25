import { mapMentorshipError, mentorshipErrorFromUnknown } from '@/services/mentorship/errors';
import { supabase } from '@/services/supabase/client';
import type { ApiResult } from '@/types/api';
import type { AdminAnalytics } from '@/features/admin/types/analytics';

function fail<T>(error: { message: string; code?: string }): ApiResult<T> {
  return { success: false, error: mapMentorshipError(error) };
}

function failUnknown<T>(e: unknown): ApiResult<T> {
  return { success: false, error: mentorshipErrorFromUnknown(e) };
}

export type SuperAdminOverview = {
  mentors: { total: number; approved: number; pending: number; suspended: number };
  mentorships: { active: number; total: number };
  waitingList: number;
  admins: number;
  superAdmins: number;
  users: number;
  opportunities: { total: number; active: number; applied: number; saved: number };
  notifications: { pendingPush: number };
};

export type SuperAdminMentorRow = {
  user_id: string;
  status: string;
  bio: string | null;
  max_students: number;
  is_accepting_students: boolean;
  applied_at: string;
  reviewed_at: string | null;
  full_name: string | null;
  email: string | null;
  active_mentees: number;
};

export type SuperAdminMenteeRow = {
  mentorship_id: string;
  status: string;
  started_at: string;
  ends_at: string;
  student_id: string;
  mentor_id: string;
  student_name: string | null;
  student_email: string | null;
  mentor_name: string | null;
};

export type SuperAdminAdminRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  opportunities_posted: number;
};

export type Paginated<T> = { items: T[]; total: number };

function parsePaginated<T>(data: unknown): Paginated<T> | null {
  if (!data || typeof data !== 'object') return null;
  const row = data as { items?: T[]; total?: number };
  return { items: row.items ?? [], total: row.total ?? 0 };
}

export const superAdminApi = {
  getOverview: async (): Promise<ApiResult<SuperAdminOverview>> => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_overview');
      if (error) return fail(error);
      const row = data as Record<string, unknown>;
      return {
        success: true,
        data: {
          mentors: row.mentors as SuperAdminOverview['mentors'],
          mentorships: row.mentorships as SuperAdminOverview['mentorships'],
          waitingList: Number((row.waiting_list as number) ?? 0),
          admins: Number(row.admins ?? 0),
          superAdmins: Number(row.super_admins ?? 0),
          users: Number(row.users ?? 0),
          opportunities: row.opportunities as SuperAdminOverview['opportunities'],
          notifications: {
            pendingPush: Number((row.notifications as { pending_push?: number })?.pending_push ?? 0),
          },
        },
      };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listMentors: async (params: {
    search?: string;
    status?: string | null;
    limit?: number;
    offset?: number;
  }): Promise<ApiResult<Paginated<SuperAdminMentorRow>>> => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_mentors', {
        p_search: params.search ?? null,
        p_status: params.status ?? null,
        p_limit: params.limit ?? 20,
        p_offset: params.offset ?? 0,
      });
      if (error) return fail(error);
      const parsed = parsePaginated<SuperAdminMentorRow>(data);
      if (!parsed) return { success: false, error: { code: 'parse', message: 'Invalid response' } };
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listMentees: async (params: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResult<Paginated<SuperAdminMenteeRow>>> => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_mentees', {
        p_search: params.search ?? null,
        p_limit: params.limit ?? 20,
        p_offset: params.offset ?? 0,
      });
      if (error) return fail(error);
      const parsed = parsePaginated<SuperAdminMenteeRow>(data);
      if (!parsed) return { success: false, error: { code: 'parse', message: 'Invalid response' } };
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  listAdmins: async (params: {
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResult<Paginated<SuperAdminAdminRow>>> => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_admins', {
        p_search: params.search ?? null,
        p_limit: params.limit ?? 20,
        p_offset: params.offset ?? 0,
      });
      if (error) return fail(error);
      const parsed = parsePaginated<SuperAdminAdminRow>(data);
      if (!parsed) return { success: false, error: { code: 'parse', message: 'Invalid response' } };
      return { success: true, data: parsed };
    } catch (e) {
      return failUnknown(e);
    }
  },

  approveMentor: async (userId: string) => {
    const { data, error } = await supabase.rpc('super_admin_approve_mentor', {
      p_user_id: userId,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  setMentorStatus: async (userId: string, status: string) => {
    const { data, error } = await supabase.rpc('super_admin_set_mentor_status', {
      p_user_id: userId,
      p_status: status,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  setAdmin: async (userId: string, isAdmin: boolean) => {
    const { data, error } = await supabase.rpc('super_admin_set_admin', {
      p_user_id: userId,
      p_is_admin: isAdmin,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  promoteAdminByEmail: async (email: string, isAdmin = true) => {
    const { data, error } = await supabase.rpc('super_admin_promote_admin_by_email', {
      p_email: email,
      p_is_admin: isAdmin,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  createMentorByEmail: async (email: string) => {
    const { data, error } = await supabase.rpc('super_admin_create_mentor_by_email', {
      p_email: email,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  deleteMentor: async (userId: string) => {
    const { data, error } = await supabase.rpc('super_admin_delete_mentor', {
      p_user_id: userId,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  broadcastToMentors: async (subject: string, body: string, targetMentorId?: string) => {
    const { data, error } = await supabase.rpc('super_admin_broadcast_to_mentors', {
      p_subject: subject,
      p_body: body,
      p_target_mentor_id: targetMentorId ?? null,
    });
    if (error) return fail(error);
    return { success: true as const, data };
  },

  getOpportunitiesAnalytics: async (): Promise<ApiResult<AdminAnalytics>> => {
    try {
      const { data, error } = await supabase.rpc('get_super_admin_opportunities_analytics');
      if (error) return fail(error);
      return { success: true, data: data as unknown as AdminAnalytics };
    } catch (e) {
      return failUnknown(e);
    }
  },
};
