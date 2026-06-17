import {
  mapMentorProfileRow,
  mapParticipantProfileRow,
} from '@/services/api/mappers/mentorship-extended.mapper';
import { supabase } from '@/services/supabase/client';
import type { AvailableMentor } from '@/types/domain/mentorship';

/**
 * Client-side fallback when `list_available_mentors` RPC is missing (pre-migration).
 * Requires RLS allowing students to read approved coach profiles.
 */
export async function listAvailableMentorsFallback(
  studentId: string,
): Promise<AvailableMentor[]> {
  const { data: mentorRows, error: mentorError } = await supabase
    .from('mentor_profiles')
    .select('*')
    .eq('status', 'approved');

  if (mentorError) throw mentorError;
  if (!mentorRows?.length) return [];

  const mentorIds = mentorRows.map((r) => r.user_id);
  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select(
      'id, full_name, email, avatar_url, country, university, course_major, degree_level, interests, career_interests, bio',
    )
    .in('id', mentorIds);

  if (profileError) throw profileError;

  const profileById = new Map((profileRows ?? []).map((p) => [p.id, p]));

  const results = await Promise.all(
    mentorRows.map(async (row) => {
      const [countRes, scoreRes] = await Promise.all([
        supabase.rpc('mentor_active_mentee_count', { p_mentor_id: row.user_id }),
        supabase.rpc('mentorship_match_score', {
          p_student_id: studentId,
          p_mentor_id: row.user_id,
        }),
      ]);

      const activeCount = Number(countRes.data ?? 0);
      const maxStudents = row.max_students ?? 10;
      const profileRow = profileById.get(row.user_id);
      const hasCapacity =
        activeCount < maxStudents &&
        row.status === 'approved' &&
        Boolean(row.is_accepting_students);

      return {
        mentorUserId: row.user_id,
        matchScore: Number(scoreRes.data ?? 0),
        activeMenteeCount: activeCount,
        maxStudents,
        hasCapacity,
        isAcceptingStudents: Boolean(row.is_accepting_students),
        profile: mapParticipantProfileRow(
          profileRow ?? {
            id: row.user_id,
            full_name: null,
            email: null,
            avatar_url: null,
            country: null,
            university: null,
            course_major: null,
            degree_level: null,
            interests: [],
            career_interests: [],
            bio: null,
          },
        ),
        mentor: mapMentorProfileRow(row),
      } satisfies AvailableMentor;
    }),
  );

  return results.sort((a, b) => b.matchScore - a.matchScore);
}
