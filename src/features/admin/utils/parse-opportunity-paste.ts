import type { LocationType } from '@/types/domain/opportunity';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { EMPTY_OPPORTUNITY_FORM } from '@/features/admin/types/opportunity-form';
import i18n from '@/i18n';
import {
  PREDEFINED_OPPORTUNITY_CATEGORIES,
  PREDEFINED_OPPORTUNITY_TAGS,
  PREDEFINED_OPPORTUNITY_COUNTRIES,
} from '@/constants/opportunity-fields';
import { DEGREE_LEVEL_VALUES } from '@/constants/onboarding';

type RawOpportunity = Record<string, unknown>;

function asString(v: unknown): string {
  if (v == null) return '';
  return String(v).trim();
}

function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.map((x) => asString(x)).filter(Boolean);
  if (typeof v === 'string') {
    return v
      .split(/[,;|]/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

function findCaseInsensitive(list: readonly string[], value: string): string | undefined {
  const lower = value.toLowerCase();
  return list.find((item) => item.toLowerCase() === lower);
}

function normalizeCountry(v: string): string {
  if (!v) return 'Global';
  return findCaseInsensitive(PREDEFINED_OPPORTUNITY_COUNTRIES, v) ?? v;
}

function normalizeCategory(v: string): string {
  if (!v) return '';
  return findCaseInsensitive(PREDEFINED_OPPORTUNITY_CATEGORIES, v) ?? v;
}

const LOCATION_ALIASES: Record<string, LocationType> = {
  remote: 'remote',
  online: 'remote',
  virtual: 'remote',
  'work from home': 'remote',
  wfh: 'remote',
  onsite: 'onsite',
  'on-site': 'onsite',
  'on site': 'onsite',
  'in-person': 'onsite',
  'in person': 'onsite',
  office: 'onsite',
  hybrid: 'hybrid',
};

function normalizeLocationType(v: string): LocationType | '' {
  if (!v) return '';
  return LOCATION_ALIASES[v.toLowerCase().trim()] ?? (v as LocationType);
}

const FUNDING_ALIASES: Record<string, string> = {
  fully_funded: 'fully_funded',
  'fully funded': 'fully_funded',
  full: 'fully_funded',
  funded: 'fully_funded',
  partially_funded: 'partially_funded',
  'partially funded': 'partially_funded',
  partial: 'partially_funded',
  self_funded: 'self_funded',
  'self funded': 'self_funded',
  self: 'self_funded',
  unfunded: 'self_funded',
};

function normalizeFundingType(v: string): string {
  if (!v) return 'fully_funded';
  return FUNDING_ALIASES[v.toLowerCase().trim()] ?? v;
}

const DEGREE_ALIASES: Record<string, string> = {
  high_school: 'high_school',
  'high school': 'high_school',
  highschool: 'high_school',
  secondary: 'high_school',
  "bachelor's": 'bachelors',
  bachelors: 'bachelors',
  bachelor: 'bachelors',
  undergraduate: 'bachelors',
  undergrad: 'bachelors',
  bsc: 'bachelors',
  ba: 'bachelors',
  "master's": 'masters',
  masters: 'masters',
  master: 'masters',
  postgraduate: 'masters',
  msc: 'masters',
  mba: 'masters',
  ma: 'masters',
  graduate: 'masters',
  phd: 'phd',
  'ph.d': 'phd',
  'ph.d.': 'phd',
  doctorate: 'phd',
  doctoral: 'phd',
  'phd / doctorate': 'phd',
  professional: 'professional',
  'professional / other': 'professional',
};

function normalizeDegreeLevel(v: string): string {
  const alias = DEGREE_ALIASES[v.toLowerCase().trim()];
  if (alias) return alias;
  const byValue = DEGREE_LEVEL_VALUES.find((value) => value.toLowerCase() === v.toLowerCase().trim());
  if (byValue) return byValue;
  return v;
}

function normalizeTag(v: string): string {
  return findCaseInsensitive(PREDEFINED_OPPORTUNITY_TAGS, v) ?? v;
}

function mapRawToForm(raw: RawOpportunity): OpportunityFormValues {
  const rawTags = asStringArray(raw.tags ?? raw.interests);
  const rawDegreeLevels = asStringArray(raw.degreeLevels ?? raw.degree_levels);

  return {
    title: asString(raw.title),
    organization: asString(raw.organization ?? raw.org),
    description: asString(raw.description),
    imageUrl: asString(raw.imageUrl ?? raw.image_url),
    deadline: asString(raw.deadline).slice(0, 10),
    tags: rawTags.map(normalizeTag),
    country: normalizeCountry(asString(raw.country)),
    category: normalizeCategory(asString(raw.category)),
    fundingType: normalizeFundingType(asString(raw.fundingType ?? raw.funding_type)),
    degreeLevels: rawDegreeLevels.map(normalizeDegreeLevel),
    locationType: normalizeLocationType(asString(raw.locationType ?? raw.location_type)),
    applyUrl: asString(raw.applyUrl ?? raw.apply_url),
  };
}

/** Parse pasted JSON (single object or array) into opportunity form rows. */
export function parseOpportunityPaste(raw: string): {
  items: OpportunityFormValues[];
  errors: string[];
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { items: [], errors: [i18n.t('admin.pasteScreen.emptyPasteError')] };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const items: OpportunityFormValues[] = [];
    const errors: string[] = [];

    list.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        errors.push(i18n.t('admin.pasteScreen.rowParseError', { row: index + 1 }));
        return;
      }
      const form = mapRawToForm(entry as RawOpportunity);
      if (!form.title || !form.organization || !form.deadline) {
        errors.push(i18n.t('admin.pasteScreen.rowMissingFieldsError', { row: index + 1 }));
        return;
      }
      items.push({ ...EMPTY_OPPORTUNITY_FORM, ...form });
    });

    return { items, errors };
  } catch {
    return {
      items: [],
      errors: [i18n.t('admin.pasteScreen.invalidJsonError')],
    };
  }
}
