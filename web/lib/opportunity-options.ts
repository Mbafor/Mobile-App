/**
 * English-only option lists for the partner "Create Opportunity" form.
 * Duplicated (not imported) from the mobile app's constants -- web/ and the
 * Expo app are separate TS programs with no shared package (same precedent
 * as partner-share-template.ts). Values here must stay in sync with the
 * literal English strings in:
 *   - src/constants/onboarding-options.ts (categories, tags)
 *   - src/constants/countries.ts (countries)
 *   - src/constants/onboarding.ts (degree levels, funding types)
 *   - src/constants/opportunity-fields.ts (location types)
 */

export const OPPORTUNITY_CATEGORIES = [
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
] as const;

export const OPPORTUNITY_TAGS = [
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
] as const;

export const OPPORTUNITY_COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Angola', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Benin', 'Botswana', 'Brazil', 'Burkina Faso', 'Burundi',
  'Cabo Verde', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile',
  'China', 'Colombia', 'Comoros', 'Democratic Republic of the Congo', 'Republic of the Congo',
  'Czech Republic', 'Denmark', 'Djibouti', 'Egypt', 'Equatorial Guinea', 'Eritrea',
  'Eswatini', 'Ethiopia', 'Finland', 'France', 'Gabon', 'Gambia', 'Germany', 'Ghana',
  'Greece', 'Guinea', 'Guinea-Bissau', 'Hong Kong', 'Hungary', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Japan', 'Jordan',
  'Kenya', 'Lesotho', 'Liberia', 'Libya', 'Madagascar', 'Malawi', 'Malaysia', 'Mali',
  'Mauritania', 'Mauritius', 'Mexico', 'Morocco', 'Mozambique', 'Namibia', 'Netherlands',
  'New Zealand', 'Niger', 'Nigeria', 'Norway', 'Pakistan', 'Philippines', 'Poland',
  'Portugal', 'Romania', 'Russia', 'Rwanda', 'São Tomé and Príncipe', 'Saudi Arabia',
  'Senegal', 'Seychelles', 'Sierra Leone', 'Singapore', 'Somalia', 'South Africa',
  'South Korea', 'South Sudan', 'Spain', 'Sudan', 'Sweden', 'Switzerland', 'Taiwan',
  'Tanzania', 'Thailand', 'Togo', 'Tunisia', 'Turkey', 'Uganda', 'Ukraine',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam', 'Zambia',
  'Zimbabwe', 'Global',
] as const;

export const DEGREE_LEVELS: { value: string; label: string }[] = [
  { value: 'high_school', label: 'High School' },
  { value: 'bachelors', label: "Bachelor's" },
  { value: 'masters', label: "Master's" },
  { value: 'phd', label: 'PhD' },
  { value: 'professional', label: 'Professional' },
];

/** Excludes "any" -- listings must state a concrete funding type. */
export const FUNDING_TYPES: { value: string; label: string }[] = [
  { value: 'fully_funded', label: 'Fully Funded' },
  { value: 'partially_funded', label: 'Partially Funded' },
  { value: 'self_funded', label: 'Self Funded' },
];

export const LOCATION_TYPES: { value: string; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];
