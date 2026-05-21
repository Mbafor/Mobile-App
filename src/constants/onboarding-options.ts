export const OTHER_OPTION_VALUE = 'Other';

export type SelectOption = {
  label: string;
  value: string;
};

function toOptions(labels: readonly string[]): SelectOption[] {
  return labels.map((label) => ({ label, value: label }));
}

export const COURSE_MAJOR_OPTIONS = toOptions([
  'Computer Science',
  'Engineering',
  'Business Administration',
  'Medicine & Health Sciences',
  'Law',
  'Education',
  'Economics',
  'Architecture',
  'Agriculture',
  'Social Sciences',
  'Arts & Humanities',
  'Mathematics & Statistics',
  'Environmental Science',
  'Psychology',
  'Media & Communication',
  OTHER_OPTION_VALUE,
] as const);

export const INTEREST_OPTIONS = toOptions([
  'Technology & Innovation',
  'Research & Academia',
  'Entrepreneurship',
  'Leadership & Management',
  'Creative Arts & Design',
  'Community & Social Impact',
  'Finance & Investment',
  'Healthcare & Wellness',
  'Sustainability & Environment',
  'Data & Analytics',
  'Policy & Governance',
  'Marketing & Branding',
  OTHER_OPTION_VALUE,
] as const);

export const OPPORTUNITY_TYPE_OPTIONS = toOptions([
  'Internship',
  'Scholarship',
  'Fellowship',
  'Graduate Programme',
  'Job (Full-time)',
  'Job (Part-time)',
  'Volunteer',
  'Research Opportunity',
  'Exchange Programme',
  'Bootcamp & Training',
  'Grant & Funding',
  'Competition & Award',
  OTHER_OPTION_VALUE,
] as const);

export const PREDEFINED_COURSE_MAJORS = COURSE_MAJOR_OPTIONS.map((o) => o.value).filter(
  (v) => v !== OTHER_OPTION_VALUE,
);

export const PREDEFINED_INTERESTS = INTEREST_OPTIONS.map((o) => o.value).filter(
  (v) => v !== OTHER_OPTION_VALUE,
);

export const PREDEFINED_OPPORTUNITY_TYPES = OPPORTUNITY_TYPE_OPTIONS.map((o) => o.value).filter(
  (v) => v !== OTHER_OPTION_VALUE,
);
