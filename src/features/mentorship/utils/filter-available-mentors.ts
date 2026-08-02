import {
  MENTOR_BROWSE_FILTERS,
  type MentorBrowseFilterId,
} from '@/features/mentorship/constants/mentor-browse-filters';
import type { AvailableMentor } from '@/types/domain/mentorship';

function mentorSearchText(mentor: AvailableMentor): string {
  const { profile, mentor: mp } = mentor;
  const parts = [
    profile.fullName ?? '',
    profile.courseMajor ?? '',
    profile.university ?? '',
    ...profile.interests,
    ...profile.careerInterests,
    mp.bio ?? '',
    ...mp.mentoringMajors,
    ...mp.mentoringInterests,
    ...mp.mentoringCareerAreas,
    ...mp.mentoringDegreeLevels,
  ];
  return parts.join(' ').toLowerCase();
}

function matchesCategory(mentor: AvailableMentor, filterId: MentorBrowseFilterId): boolean {
  if (filterId === 'all') return true;
  const def = MENTOR_BROWSE_FILTERS.find((f) => f.id === filterId);
  if (!def || def.keywords.length === 0) return true;

  const haystack = mentorSearchText(mentor);
  return def.keywords.some((kw) => haystack.includes(kw.toLowerCase()));
}

export function filterAvailableMentors(
  mentors: AvailableMentor[],
  query: string,
  categoryFilter: MentorBrowseFilterId,
): AvailableMentor[] {
  const q = query.trim().toLowerCase();

  return mentors.filter((m) => {
    if (!matchesCategory(m, categoryFilter)) return false;
    if (!q) return true;
    return mentorSearchText(m).includes(q);
  });
}

/** `recommended` is a curated top-N highlight (ranked by match score, which
 * itself weighs Major above Interest -- see mentorship_match_score() in
 * migration 063). `all` is always the full roster, independent of who made
 * the highlight reel, so "All coaches" never goes empty just because every
 * mentor happens to score above zero. */
export function partitionRecommendedMentors(mentors: AvailableMentor[], limit = 4): {
  recommended: AvailableMentor[];
  all: AvailableMentor[];
} {
  const recommended = [...mentors]
    .filter((m) => m.matchScore > 0)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, limit);

  const all = [...mentors].sort((a, b) =>
    (a.profile.fullName ?? '').localeCompare(b.profile.fullName ?? ''),
  );

  return { recommended, all };
}

/** "Popular" = real demand signal (active mentee count), not a fabricated
 * metric -- we have no booking-count or rating data to back a "Most Booked"
 * or "Top Rated" section, so this is the one legitimate ranking beyond match
 * score and name. */
export function getPopularMentors(mentors: AvailableMentor[], limit = 10): AvailableMentor[] {
  return [...mentors]
    .filter((m) => m.activeMenteeCount > 0)
    .sort((a, b) => b.activeMenteeCount - a.activeMenteeCount)
    .slice(0, limit);
}

export function platformHasNoCoaches(mentors: AvailableMentor[]): boolean {
  return mentors.length === 0;
}

export function allMentorsAtCapacity(mentors: AvailableMentor[]): boolean {
  const accepting = mentors.filter((m) => m.isAcceptingStudents);
  return accepting.length > 0 && accepting.every((m) => !m.hasCapacity);
}

/** Waiting list only when we successfully loaded coaches and none can be chosen. */
export function shouldOfferWaitingList(mentors: AvailableMentor[]): boolean {
  if (mentors.length === 0) return true;
  const choosable = mentors.some((m) => m.isAcceptingStudents && m.hasCapacity);
  return !choosable;
}
