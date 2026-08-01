/** Shared parse/validate logic for the Partner and Admin "Create"/"Edit" opportunity forms. */

export interface ParsedOpportunity {
  title: string;
  organization: string;
  description: string | null;
  benefits: string | null;
  imageUrl: string | null;
  applyUrl: string | null;
  deadlineIso: string | null;
  category: string;
  tags: string[];
  country: string;
  fundingType: string;
  degreeLevels: string[];
  locationType: string;
}

export type ParseOpportunityFormResult =
  | { ok: true; data: ParsedOpportunity }
  | { ok: false; message: string };

function parseDeadline(dateInput: string): string | null {
  const trimmed = dateInput.trim();
  if (!trimmed) return null;
  const parsed = new Date(`${trimmed}T23:59:59.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

/** requireDeadline gates presence + future-date checks. Only fresh publishes
 * (admin/partner "create", bulk paste) need it -- editing an already-approved
 * opportunity must not force a stale or evergreen (NULL, see migration 041)
 * deadline to be rewritten just to save an unrelated field. Mirrors the
 * mobile app's formToRow, which treats deadline as update-optional
 * (src/services/api/admin.api.ts). */
export function parseOpportunityForm(
  formData: FormData,
  { requireDeadline = true }: { requireDeadline?: boolean } = {},
): ParseOpportunityFormResult {
  const title = String(formData.get('title') ?? '').trim();
  const organization = String(formData.get('organization') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const benefits = String(formData.get('benefits') ?? '').trim();
  const imageUrl = String(formData.get('imageUrl') ?? '').trim();
  const applyUrl = String(formData.get('applyUrl') ?? '').trim();
  const deadlineInput = String(formData.get('deadline') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const country = String(formData.get('country') ?? '').trim();
  const fundingType = String(formData.get('fundingType') ?? '').trim();
  const locationType = String(formData.get('locationType') ?? '').trim();
  const tags = formData.getAll('tags').map((t) => String(t).trim()).filter(Boolean);
  const degreeLevels = formData.getAll('degreeLevels').map((d) => String(d).trim()).filter(Boolean);

  if (!title || !organization) {
    return { ok: false, message: 'Title and organization are required.' };
  }
  if (requireDeadline && !deadlineInput) {
    return { ok: false, message: 'Deadline is required.' };
  }
  if (!category) {
    return { ok: false, message: 'Please select a category.' };
  }
  if (!country) {
    return { ok: false, message: 'Please select a country.' };
  }

  const tagSet = new Set(tags);
  tagSet.add(category);

  if (degreeLevels.length === 0) {
    return { ok: false, message: 'Please select at least one degree level.' };
  }
  if (!locationType) {
    return { ok: false, message: 'Please select a location type.' };
  }
  if (!fundingType || fundingType === 'any') {
    return { ok: false, message: 'Please select a funding type.' };
  }

  let deadlineIso: string | null = null;
  if (deadlineInput) {
    deadlineIso = parseDeadline(deadlineInput);
    if (!deadlineIso) {
      return { ok: false, message: 'Enter a valid deadline date.' };
    }
    if (requireDeadline && new Date(deadlineIso).getTime() <= Date.now()) {
      return { ok: false, message: 'Deadline must be in the future so students can see this listing.' };
    }
  }

  return {
    ok: true,
    data: {
      title,
      organization,
      description: description || null,
      benefits: benefits || null,
      imageUrl: imageUrl || null,
      applyUrl: applyUrl || null,
      deadlineIso,
      category,
      tags: [...tagSet],
      country,
      fundingType,
      degreeLevels,
      locationType,
    },
  };
}
