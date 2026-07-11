import i18n from '@/i18n';

export const OTHER_OPTION_VALUE = 'Other';

export type SelectOption = {
  label: string;
  value: string;
};

type OptionDef = { id: string; value: string };

/** Builds translated {value,label} pairs. `value` is the literal English string persisted to the DB — never translated. */
function toTranslatedOptions(category: string, defs: readonly OptionDef[]): SelectOption[] {
  return [
    ...defs.map(({ id, value }) => ({ value, label: i18n.t(`shared.options.${category}.${id}`) })),
    { value: OTHER_OPTION_VALUE, label: i18n.t('shared.options.other') },
  ];
}

const COURSE_MAJOR_DEFS: OptionDef[] = [
  { id: 'computerScience', value: 'Computer Science' },
  { id: 'engineering', value: 'Engineering' },
  { id: 'businessAdministration', value: 'Business Administration' },
  { id: 'medicineHealthSciences', value: 'Medicine & Health Sciences' },
  { id: 'law', value: 'Law' },
  { id: 'education', value: 'Education' },
  { id: 'economics', value: 'Economics' },
  { id: 'architecture', value: 'Architecture' },
  { id: 'agriculture', value: 'Agriculture' },
  { id: 'socialSciences', value: 'Social Sciences' },
  { id: 'artsHumanities', value: 'Arts & Humanities' },
  { id: 'mathematicsStatistics', value: 'Mathematics & Statistics' },
  { id: 'environmentalScience', value: 'Environmental Science' },
  { id: 'psychology', value: 'Psychology' },
  { id: 'mediaCommunication', value: 'Media & Communication' },
];

const INTEREST_DEFS: OptionDef[] = [
  { id: 'technologyInnovation', value: 'Technology & Innovation' },
  { id: 'researchAcademia', value: 'Research & Academia' },
  { id: 'entrepreneurship', value: 'Entrepreneurship' },
  { id: 'leadershipManagement', value: 'Leadership & Management' },
  { id: 'creativeArtsDesign', value: 'Creative Arts & Design' },
  { id: 'communitySocialImpact', value: 'Community & Social Impact' },
  { id: 'financeInvestment', value: 'Finance & Investment' },
  { id: 'healthcareWellness', value: 'Healthcare & Wellness' },
  { id: 'sustainabilityEnvironment', value: 'Sustainability & Environment' },
  { id: 'dataAnalytics', value: 'Data & Analytics' },
  { id: 'policyGovernance', value: 'Policy & Governance' },
  { id: 'marketingBranding', value: 'Marketing & Branding' },
];

const OPPORTUNITY_TYPE_DEFS: OptionDef[] = [
  { id: 'internship', value: 'Internship' },
  { id: 'scholarship', value: 'Scholarship' },
  { id: 'fellowship', value: 'Fellowship' },
  { id: 'graduateProgramme', value: 'Graduate Programme' },
  { id: 'jobFullTime', value: 'Job (Full-time)' },
  { id: 'jobPartTime', value: 'Job (Part-time)' },
  { id: 'volunteer', value: 'Volunteer' },
  { id: 'researchOpportunity', value: 'Research Opportunity' },
  { id: 'exchangeProgramme', value: 'Exchange Programme' },
  { id: 'bootcampTraining', value: 'Bootcamp & Training' },
  { id: 'grantFunding', value: 'Grant & Funding' },
  { id: 'competitionAward', value: 'Competition & Award' },
];

/** Translated display options — call at render time, not at module scope. */
export function getCourseMajorOptions(): SelectOption[] {
  return toTranslatedOptions('courseMajors', COURSE_MAJOR_DEFS);
}

/** Translated display options — call at render time, not at module scope. */
export function getInterestOptions(): SelectOption[] {
  return toTranslatedOptions('interests', INTEREST_DEFS);
}

/** Translated display options — call at render time, not at module scope. */
export function getOpportunityTypeOptions(): SelectOption[] {
  return toTranslatedOptions('opportunityTypes', OPPORTUNITY_TYPE_DEFS);
}

export const PREDEFINED_COURSE_MAJORS = COURSE_MAJOR_DEFS.map((o) => o.value);
export const PREDEFINED_INTERESTS = INTEREST_DEFS.map((o) => o.value);
export const PREDEFINED_OPPORTUNITY_TYPES = OPPORTUNITY_TYPE_DEFS.map((o) => o.value);
