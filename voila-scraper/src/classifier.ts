import type { RawOpportunity, OpportunityRecord } from './types';

type Category =
  | 'Internship'
  | 'Scholarship'
  | 'Fellowship'
  | 'Graduate Programme'
  | 'Job (Full-time)'
  | 'Job (Part-time)'
  | 'Volunteer'
  | 'Research Opportunity'
  | 'Exchange Programme'
  | 'Bootcamp & Training'
  | 'Grant & Funding'
  | 'Competition & Award';

type Tag =
  | 'Technology & Innovation'
  | 'Research & Academia'
  | 'Entrepreneurship'
  | 'Leadership & Management'
  | 'Creative Arts & Design'
  | 'Community & Social Impact'
  | 'Finance & Investment'
  | 'Healthcare & Wellness'
  | 'Sustainability & Environment'
  | 'Data & Analytics'
  | 'Policy & Governance'
  | 'Marketing & Branding';

type FundingType = 'fully_funded' | 'partially_funded' | 'self_funded';
type LocationType = 'remote' | 'onsite' | 'hybrid';
type DegreeLevel = 'high_school' | 'bachelors' | 'masters' | 'phd' | 'professional';

function lower(text: string): string {
  return text.toLowerCase();
}

function classifyCategory(text: string): Category {
  const t = lower(text);
  if (/scholarship|tuition|study award|bursary/.test(t)) return 'Scholarship';
  if (/\bfellowship\b/.test(t)) return 'Fellowship';
  if (/\binternship\b|\bintern\b/.test(t)) return 'Internship';
  if (/graduate programme|graduate program|grad scheme/.test(t)) return 'Graduate Programme';
  if (/full[- ]time|\bpermanent\b/.test(t)) return 'Job (Full-time)';
  if (/part[- ]time/.test(t)) return 'Job (Part-time)';
  if (/\bvolunteer\b|volunteering/.test(t)) return 'Volunteer';
  if (/research opportunity|\bresearcher?\b/.test(t)) return 'Research Opportunity';
  if (/exchange programme|exchange program/.test(t)) return 'Exchange Programme';
  if (/\bbootcamp\b|\btraining\b|\bcourse\b|\bworkshop\b/.test(t)) return 'Bootcamp & Training';
  if (/\bgrant\b|\bfunding\b|seed fund/.test(t)) return 'Grant & Funding';
  if (/competition|\baward\b|\bprize\b|\bchallenge\b/.test(t)) return 'Competition & Award';
  return 'Internship';
}

function classifyFundingType(text: string): FundingType {
  const t = lower(text);
  if (/fully funded|all expenses|full scholarship|covers tuition|stipend.{0,20}accommodation|expenses covered/.test(t)) return 'fully_funded';
  if (/partial|partially funded|some funding|travel grant/.test(t)) return 'partially_funded';
  return 'self_funded';
}

function classifyLocationType(text: string): LocationType {
  const t = lower(text);
  if (/\bremote\b|\bvirtual\b|\bonline\b|work from home/.test(t)) return 'remote';
  if (/\bhybrid\b/.test(t)) return 'hybrid';
  return 'onsite';
}

function classifyDegreeLevels(text: string): DegreeLevel[] {
  const t = lower(text);
  const levels = new Set<DegreeLevel>();
  if (/undergraduate|\bbachelor\b|\bbsc\b|\bba\b/.test(t)) levels.add('bachelors');
  if (/\bmaster\b|\bmsc\b|\bmba\b|postgraduate/.test(t)) levels.add('masters');
  if (/\bphd\b|\bdoctorate\b|\bdphil\b/.test(t)) levels.add('phd');
  if (/high school|secondary school|o[- ]level|a[- ]level/.test(t)) levels.add('high_school');
  if (/\bprofessional\b|working professional/.test(t)) levels.add('professional');
  return Array.from(levels);
}

const COUNTRIES: string[] = [
  'Afghanistan', 'Albania', 'Algeria', 'Argentina', 'Australia', 'Austria',
  'Bangladesh', 'Belgium', 'Botswana', 'Brazil', 'Cameroon', 'Canada',
  'Chile', 'China', 'Colombia', 'Democratic Republic of Congo', 'Egypt',
  'Ethiopia', 'Finland', 'France', 'Germany', 'Ghana', 'India', 'Indonesia',
  'Italy', 'Japan', 'Jordan', 'Kenya', 'Lebanon', 'Liberia', 'Madagascar',
  'Malawi', 'Malaysia', 'Mali', 'Mauritius', 'Mexico', 'Morocco', 'Mozambique',
  'Namibia', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Pakistan',
  'Philippines', 'Portugal', 'Romania', 'Rwanda', 'Senegal', 'Sierra Leone',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sudan', 'Sweden',
  'Switzerland', 'Tanzania', 'Thailand', 'Tunisia', 'Turkey', 'Uganda',
  'Ukraine', 'United Kingdom', 'United States', 'Vietnam', 'Zambia', 'Zimbabwe',
  'West Africa', 'East Africa', 'Southern Africa', 'Central Africa',
  'North Africa', 'Sub-Saharan Africa',
];

const COUNTRY_ALIASES: Record<string, string> = {
  'uk': 'United Kingdom',
  'usa': 'United States',
  'us': 'United States',
  'drc': 'Democratic Republic of Congo',
};

function classifyCountry(text: string): string {
  const t = lower(text);
  if (/global|worldwide|all countries|international|anywhere|across the world|open to all/.test(t)) {
    return 'Global';
  }
  for (const [alias, canonical] of Object.entries(COUNTRY_ALIASES)) {
    const re = new RegExp(`\\b${alias}\\b`, 'i');
    if (re.test(text)) return canonical;
  }
  for (const country of COUNTRIES) {
    if (t.includes(lower(country))) return country;
  }
  return 'Global';
}

function classifyTags(text: string): Tag[] {
  const t = lower(text);
  const tags: Tag[] = [];
  if (/\btech\b|software|\bai\b|\bcoding\b|\bdigital\b|programming|computer|\bict\b/.test(t)) tags.push('Technology & Innovation');
  if (/\bresearch\b|\bacademic\b|\bscience\b|\blab\b|\bscholar\b/.test(t)) tags.push('Research & Academia');
  if (/startup|entrepreneur|\bbusiness\b|\binnovation\b|\bventure\b/.test(t)) tags.push('Entrepreneurship');
  if (/leadership|management|executive|\bmanager\b/.test(t)) tags.push('Leadership & Management');
  if (/\bdesign\b|\bart\b|\bcreative\b|\bmedia\b|\bfilm\b|photography|animation/.test(t)) tags.push('Creative Arts & Design');
  if (/community|\bsocial\b|\bngo\b|nonprofit|non-profit|\bdevelopment\b|humanitarian/.test(t)) tags.push('Community & Social Impact');
  if (/\bfinance\b|investment|\bbanking\b|\beconomics\b|\bfinancial\b/.test(t)) tags.push('Finance & Investment');
  if (/\bhealth\b|\bmedical\b|\bwellness\b|\bclinical\b|\bmedicine\b|\bnursing\b/.test(t)) tags.push('Healthcare & Wellness');
  if (/environment|\bclimate\b|sustainability|\bgreen\b|renewable|\becology\b/.test(t)) tags.push('Sustainability & Environment');
  if (/\bdata\b|\banalytics\b|statistics|\bml\b|machine learning|artificial intelligence/.test(t)) tags.push('Data & Analytics');
  if (/\bpolicy\b|governance|\blaw\b|\bgovernment\b|\blegal\b|regulation/.test(t)) tags.push('Policy & Governance');
  if (/\bmarketing\b|\bbrand\b|communications|\bpr\b|advertising|public relations/.test(t)) tags.push('Marketing & Branding');
  return tags.slice(0, 3);
}

export function classify(raw: RawOpportunity): OpportunityRecord {
  const combined = `${raw.title} ${raw.description} ${raw.organization}`;
  return {
    title: raw.title,
    organization: raw.organization,
    description: raw.description,
    deadline: raw.deadline || null,
    apply_url: raw.applyUrl,
    image_url: raw.imageUrl,
    category: classifyCategory(combined),
    country: classifyCountry(combined),
    tags: classifyTags(combined),
    funding_type: classifyFundingType(combined),
    degree_levels: classifyDegreeLevels(combined),
    location_type: classifyLocationType(combined),
    source: raw.source,
    status: 'pending',
    is_active: false,
  };
}
