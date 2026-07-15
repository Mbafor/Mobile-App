/** Single source of truth for the fixed event category list — used by the
 * create/edit event form and the event list's category filter. */
import type { SelectOption } from '@/constants/onboarding-options';
import i18n from '@/i18n';

const EVENT_CATEGORY_DEFS = [
  { id: 'applicationSupport', value: 'Application Support' },
  { id: 'scholarshipInfoSession', value: 'Scholarship Info Session' },
  { id: 'careerInternshipPrep', value: 'Career & Internship Prep' },
  { id: 'mentorshipNetworking', value: 'Mentorship & Networking' },
  { id: 'skillsTraining', value: 'Skills & Training' },
  { id: 'studyAbroadExchange', value: 'Study Abroad & Exchange' },
  { id: 'fellowshipResearch', value: 'Fellowship & Research Opportunities' },
  { id: 'entrepreneurshipFunding', value: 'Entrepreneurship & Funding' },
  { id: 'generalCommunity', value: 'General/Community' },
] as const;

/** Translated display options — call at render time, not at module scope. */
export function getEventCategoryOptions(): SelectOption[] {
  return EVENT_CATEGORY_DEFS.map(({ id, value }) => ({
    value,
    label: i18n.t(`shared.options.eventCategories.${id}`),
  }));
}

export const EVENT_CATEGORY_LIST = EVENT_CATEGORY_DEFS.map((d) => d.value);

export type EventCategory = (typeof EVENT_CATEGORY_DEFS)[number]['value'];
