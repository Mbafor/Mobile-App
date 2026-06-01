import type { AvailableMentor } from '@/types/domain/mentorship';

export function getMentorAcademicFocus(mentor: AvailableMentor): string[] {
  const { profile, mentor: mp } = mentor;
  return [
    ...new Set([
      ...mp.mentoringMajors,
      ...(profile.courseMajor?.trim() ? [profile.courseMajor.trim()] : []),
      ...mp.mentoringDegreeLevels,
    ]),
  ].filter(Boolean);
}

export function getMentorInterestTags(mentor: AvailableMentor): string[] {
  const { profile, mentor: mp } = mentor;
  return [
    ...new Set([
      ...mp.mentoringInterests,
      ...mp.mentoringCareerAreas,
      ...profile.interests,
      ...profile.careerInterests,
    ]),
  ].filter(Boolean);
}
