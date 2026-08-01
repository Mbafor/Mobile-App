/** Ported from src/features/admin/utils/parse-opportunity-paste.ts (mobile app) --
 * same bulk-paste normalization rules, duplicated rather than imported since web/
 * and the Expo app are separate TS programs with no shared package. Unlike the
 * single-opportunity form (opportunity-form.ts), only title/organization/deadline
 * are required here -- this is a bulk-import escape hatch, so category/country/
 * degreeLevels/locationType/fundingType are normalized but not required per row. */

import {
  DEGREE_LEVELS,
  OPPORTUNITY_CATEGORIES,
  OPPORTUNITY_COUNTRIES,
  OPPORTUNITY_TAGS,
} from './opportunity-options';
import type { ParsedOpportunity } from './opportunity-form';

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
  return findCaseInsensitive(OPPORTUNITY_COUNTRIES, v) ?? v;
}

function normalizeCategory(v: string): string {
  if (!v) return '';
  return findCaseInsensitive(OPPORTUNITY_CATEGORIES, v) ?? v;
}

const LOCATION_ALIASES: Record<string, string> = {
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

function normalizeLocationType(v: string): string {
  if (!v) return '';
  return LOCATION_ALIASES[v.toLowerCase().trim()] ?? v;
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

const DEGREE_VALUES = DEGREE_LEVELS.map((d) => d.value);

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
  const byValue = DEGREE_VALUES.find((value) => value.toLowerCase() === v.toLowerCase().trim());
  if (byValue) return byValue;
  return v;
}

function normalizeTag(v: string): string {
  return findCaseInsensitive(OPPORTUNITY_TAGS, v) ?? v;
}

function parseDeadline(dateInput: string): string | null {
  const trimmed = dateInput.trim();
  if (!trimmed) return null;
  // Bare "YYYY-MM-DD" from pasted JSON -- treat as end-of-day UTC, same convention
  // parseOpportunityForm uses for the date-only <input type="date"> field.
  const dateOnly = trimmed.slice(0, 10);
  const parsed = new Date(`${dateOnly}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function mapRawToParsed(raw: RawOpportunity): { ok: true; data: ParsedOpportunity } | { ok: false; message: string } {
  const title = asString(raw.title);
  const organization = asString(raw.organization ?? raw.org);
  const deadlineIso = parseDeadline(asString(raw.deadline));

  if (!title || !organization || !deadlineIso) {
    return { ok: false, message: 'Missing title, organization, or a valid deadline.' };
  }

  const rawTags = asStringArray(raw.tags ?? raw.interests);
  const rawDegreeLevels = asStringArray(raw.degreeLevels ?? raw.degree_levels);
  const category = normalizeCategory(asString(raw.category));
  const tags = rawTags.map(normalizeTag);
  if (category && !tags.includes(category)) tags.push(category);

  return {
    ok: true,
    data: {
      title,
      organization,
      description: asString(raw.description) || null,
      benefits: asString(raw.benefits) || null,
      imageUrl: asString(raw.imageUrl ?? raw.image_url) || null,
      applyUrl: asString(raw.applyUrl ?? raw.apply_url) || null,
      deadlineIso,
      category,
      tags,
      country: normalizeCountry(asString(raw.country)),
      fundingType: normalizeFundingType(asString(raw.fundingType ?? raw.funding_type)),
      degreeLevels: rawDegreeLevels.map(normalizeDegreeLevel),
      locationType: normalizeLocationType(asString(raw.locationType ?? raw.location_type)),
    },
  };
}

/** Parse pasted JSON (single object or array) into opportunity rows ready to insert. */
export function parseOpportunityPaste(raw: string): {
  items: ParsedOpportunity[];
  errors: string[];
} {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { items: [], errors: ['Paste some JSON first.'] };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    return { items: [], errors: ['That is not valid JSON.'] };
  }

  const list = Array.isArray(parsed) ? parsed : [parsed];
  const items: ParsedOpportunity[] = [];
  const errors: string[] = [];

  list.forEach((entry, index) => {
    if (!entry || typeof entry !== 'object') {
      errors.push(`Row ${index + 1}: not a JSON object.`);
      return;
    }
    const result = mapRawToParsed(entry as RawOpportunity);
    if (!result.ok) {
      errors.push(`Row ${index + 1}: ${result.message}`);
      return;
    }
    items.push(result.data);
  });

  return { items, errors };
}
