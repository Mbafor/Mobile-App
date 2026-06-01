/** Browse filter chips — keywords match mentor mentoring_* arrays and profile tags. */
export type MentorBrowseFilterId =
  | 'all'
  | 'technology'
  | 'business'
  | 'career'
  | 'scholarships'
  | 'research'
  | 'entrepreneurship';

export type MentorBrowseFilter = {
  id: MentorBrowseFilterId;
  label: string;
  keywords: string[];
};

export const MENTOR_BROWSE_FILTERS: MentorBrowseFilter[] = [
  { id: 'all', label: 'All', keywords: [] },
  {
    id: 'technology',
    label: 'Technology',
    keywords: ['Technology & Innovation', 'Data & Analytics', 'Computer Science', 'Engineering'],
  },
  {
    id: 'business',
    label: 'Business',
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
    label: 'Career',
    keywords: ['Leadership & Management', 'career', 'Job', 'Graduate Programme'],
  },
  {
    id: 'scholarships',
    label: 'Scholarships',
    keywords: ['Scholarship', 'Grant & Funding', 'Fellowship'],
  },
  {
    id: 'research',
    label: 'Research',
    keywords: ['Research & Academia', 'Research Opportunity', 'Mathematics & Statistics'],
  },
  {
    id: 'entrepreneurship',
    label: 'Entrepreneurship',
    keywords: ['Entrepreneurship', 'Innovation'],
  },
];
