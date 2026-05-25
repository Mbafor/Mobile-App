import type { LocationType } from '@/types/domain/opportunity';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { EMPTY_OPPORTUNITY_FORM } from '@/features/admin/types/opportunity-form';

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

function mapRawToForm(raw: RawOpportunity): OpportunityFormValues {
  return {
    title: asString(raw.title),
    organization: asString(raw.organization ?? raw.org),
    description: asString(raw.description),
    imageUrl: asString(raw.imageUrl ?? raw.image_url),
    deadline: asString(raw.deadline).slice(0, 10),
    tags: asStringArray(raw.tags ?? raw.interests),
    country: asString(raw.country) || 'Global',
    category: asString(raw.category),
    fundingType: asString(raw.fundingType ?? raw.funding_type) || 'fully_funded',
    degreeLevels: asStringArray(raw.degreeLevels ?? raw.degree_levels),
    locationType: (asString(raw.locationType ?? raw.location_type) || 'remote') as LocationType,
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
    return { items: [], errors: ['Paste JSON for one opportunity or an array of opportunities.'] };
  }

  try {
    const parsed = JSON.parse(trimmed) as unknown;
    const list = Array.isArray(parsed) ? parsed : [parsed];
    const items: OpportunityFormValues[] = [];
    const errors: string[] = [];

    list.forEach((entry, index) => {
      if (!entry || typeof entry !== 'object') {
        errors.push(`Row ${index + 1}: expected an object.`);
        return;
      }
      const form = mapRawToForm(entry as RawOpportunity);
      if (!form.title || !form.organization || !form.deadline) {
        errors.push(`Row ${index + 1}: title, organization, and deadline are required.`);
        return;
      }
      items.push({ ...EMPTY_OPPORTUNITY_FORM, ...form });
    });

    return { items, errors };
  } catch {
    return {
      items: [],
      errors: ['Invalid JSON. Paste a single object or an array of opportunity objects.'],
    };
  }
}
