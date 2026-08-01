/** Ported from src/services/api/super-admin.api.ts (mobile app) -- same RPC
 * payload shapes, duplicated rather than imported since web/ and the Expo app
 * are separate TS programs with no shared package. */

export interface SuperAdminOverview {
  mentors: { total: number; approved: number; pending: number; suspended: number };
  mentorships: { active: number; total: number };
  waitingList: number;
  admins: number;
  superAdmins: number;
  users: number;
  opportunities: { total: number; active: number; applied: number; saved: number };
  notifications: { pendingPush: number };
}

export function mapSuperAdminOverview(payload: unknown): SuperAdminOverview | null {
  if (!payload || typeof payload !== 'object') return null;
  const row = payload as Record<string, unknown>;
  return {
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
  };
}

export interface SuperAdminAdminRow {
  id: string;
  full_name: string | null;
  email: string | null;
  is_admin: boolean;
  is_super_admin: boolean;
  created_at: string;
  opportunities_posted: number;
}

export interface SuperAdminMentorRow {
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
}

export interface SuperAdminMenteeRow {
  mentorship_id: string;
  status: string;
  started_at: string;
  ends_at: string;
  student_id: string;
  mentor_id: string;
  student_name: string | null;
  student_email: string | null;
  mentor_name: string | null;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

export function parsePaginated<T>(data: unknown): Paginated<T> {
  if (!data || typeof data !== 'object') return { items: [], total: 0 };
  const row = data as { items?: T[]; total?: number };
  return { items: row.items ?? [], total: row.total ?? 0 };
}
