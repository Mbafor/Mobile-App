/** Browse filter chips — keywords match mentor mentoring_* arrays and profile tags. */
export type MentorBrowseFilterId =
  | 'all'
  | 'technology'
  | 'business'
  | 'career'
  | 'scholarships'
  | 'research'
  | 'entrepreneurship';

/**
 * `keywords` drive matching (data). Display labels are resolved via i18n at the
 * call site, keyed by `id` under `mentorship.student.browseFilters.*`.
 */
export type MentorBrowseFilter = {
  id: MentorBrowseFilterId;
  keywords: string[];
};

export const MENTOR_BROWSE_FILTERS: MentorBrowseFilter[] = [
  { id: 'all', keywords: [] },
  {
    id: 'technology',
    keywords: ['Technology & Innovation', 'Data & Analytics', 'Computer Science', 'Engineering'],
  },
  {
    id: 'business',
    keywords: [
      'Business Administration',
      'Business',
      'Finance & Investment',
      'Leadership & Management',
      'Marketing & Branding',
      'Economics',
    ],
  },
  {
    id: 'career',
    keywords: ['Leadership & Management', 'career', 'Job', 'Graduate Programme'],
  },
  {
    id: 'scholarships',
    keywords: ['Scholarship', 'Grant & Funding', 'Fellowship'],
  },
  {
    id: 'research',
    keywords: ['Research & Academia', 'Research Opportunity', 'Mathematics & Statistics'],
  },
  {
    id: 'entrepreneurship',
    keywords: ['Entrepreneurship', 'Innovation'],
  },
];
