export const CV_SECTIONS = [
  { id: 'personal', label: 'Personal' },
  { id: 'summary', label: 'Summary' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'skills', label: 'Skills' },
  { id: 'certifications', label: 'Certificates' },
  { id: 'hobbies', label: 'Hobbies' },
  { id: 'languages', label: 'Languages' },
  { id: 'voluntary', label: 'Volunteer' },
] as const;

export type CVSectionId = (typeof CV_SECTIONS)[number]['id'];

export const ALL_SECTION_IDS: CVSectionId[] = CV_SECTIONS.map((s) => s.id);

/** Sections that do not block overall progress when empty. */
export const OPTIONAL_SECTION_IDS: CVSectionId[] = ['hobbies', 'voluntary', 'certifications'];

export const DEFAULT_SECTION_ORDER: CVSectionId[] = [...ALL_SECTION_IDS];
