'use server';

import { revalidatePath } from 'next/cache';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { parseOpportunityForm, type ParsedOpportunity } from '@/lib/opportunity-form';
import { parseOpportunityPaste } from '@/lib/opportunity-paste';
import type { OpportunityFormResult } from '@/app/opportunities/_shared/OpportunityForm';

export type AdminOpportunityMutationResult = OpportunityFormResult;

function toRow(data: ParsedOpportunity) {
  return {
    title: data.title,
    organization: data.organization,
    description: data.description,
    benefits: data.benefits,
    image_url: data.imageUrl,
    apply_url: data.applyUrl,
    deadline: data.deadlineIso,
    tags: data.tags,
    country: data.country,
    category: data.category,
    funding_type: data.fundingType,
    degree_levels: data.degreeLevels,
    location_type: data.locationType,
  };
}

/** Admin-created opportunities publish immediately (status='approved'),
 * unlike scraped/partner submissions which land in the pending queue --
 * mirrors adminApi.createOpportunity in the mobile app (src/services/api/admin.api.ts). */
export async function createAdminOpportunity(formData: FormData): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();

  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return parsed;

  const client = createUserClient(session.accessToken);
  const { error } = await client.from('opportunities').insert({
    ...toRow(parsed.data),
    status: 'approved',
    is_active: true,
    created_by: session.admin.id,
  });

  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin');

  return { ok: true };
}

/** Edits an already-approved opportunity in place -- no status change. */
export async function updateAdminOpportunity(
  opportunityId: string,
  formData: FormData,
): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();

  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return parsed;

  const client = createUserClient(session.accessToken);
  const { error, count } = await client
    .from('opportunities')
    .update(toRow(parsed.data), { count: 'exact' })
    .eq('id', opportunityId);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Opportunity not found.' };

  revalidatePath('/admin/opportunities');
  revalidatePath(`/admin/opportunities/${opportunityId}`);

  return { ok: true };
}

/** Saves edits made during review, then approves in the same action --
 * approve_opportunity (039_opportunity_approval_flow.sql) flips status/is_active/
 * reviewed_at/reviewed_by itself. */
export async function updateAndApproveAdminOpportunity(
  opportunityId: string,
  formData: FormData,
): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();

  const parsed = parseOpportunityForm(formData);
  if (!parsed.ok) return parsed;

  const client = createUserClient(session.accessToken);
  const { error: updateError, count } = await client
    .from('opportunities')
    .update(toRow(parsed.data), { count: 'exact' })
    .eq('id', opportunityId);

  if (updateError) return { ok: false, message: updateError.message };
  if (!count) return { ok: false, message: 'Opportunity not found.' };

  const { error: approveError } = await client.rpc('approve_opportunity', {
    p_opportunity_id: opportunityId,
  });
  if (approveError) return { ok: false, message: approveError.message };

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin/opportunities/pending');
  revalidatePath(`/admin/opportunities/${opportunityId}`);
  revalidatePath('/admin');

  return { ok: true };
}

/** Quick-approve from the pending queue -- no field edits. */
export async function quickApproveAdminOpportunity(opportunityId: string): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('approve_opportunity', { p_opportunity_id: opportunityId });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin/opportunities/pending');
  revalidatePath('/admin');

  return { ok: true };
}

/** Used by both the queue's quick-reject and the review page's Reject button. */
export async function rejectAdminOpportunity(opportunityId: string): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error } = await client.rpc('reject_opportunity', { p_opportunity_id: opportunityId });
  if (error) return { ok: false, message: error.message };

  revalidatePath('/admin/opportunities/pending');
  revalidatePath('/admin');

  return { ok: true };
}

/** Removes an opportunity entirely (used from the approved-opportunities manage list). */
export async function deleteAdminOpportunity(opportunityId: string): Promise<AdminOpportunityMutationResult> {
  const session = await requireAdminSession();
  const client = createUserClient(session.accessToken);

  const { error, count } = await client
    .from('opportunities')
    .delete({ count: 'exact' })
    .eq('id', opportunityId);

  if (error) return { ok: false, message: error.message };
  if (!count) return { ok: false, message: 'Opportunity not found.' };

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin');

  return { ok: true };
}

export interface ImportPasteResult {
  ok: number;
  total: number;
  errors: string[];
}

/** Bulk-creates opportunities from pasted JSON (single object or array) --
 * mirrors the mobile app's OpportunityPasteScreen: each row is normalized and
 * inserted independently, so one bad row doesn't block the rest of the batch. */
export async function importPastedOpportunities(formData: FormData): Promise<ImportPasteResult> {
  const session = await requireAdminSession();
  const raw = String(formData.get('raw') ?? '');

  const { items, errors: parseErrors } = parseOpportunityPaste(raw);
  if (items.length === 0) {
    return { ok: 0, total: 0, errors: parseErrors.length > 0 ? parseErrors : ['Nothing to import.'] };
  }

  const client = createUserClient(session.accessToken);
  const errors = [...parseErrors];
  let ok = 0;

  for (let i = 0; i < items.length; i++) {
    const data = items[i];
    if (new Date(data.deadlineIso).getTime() <= Date.now()) {
      errors.push(`Row ${i + 1}: deadline must be in the future.`);
      continue;
    }

    const { error } = await client.from('opportunities').insert({
      ...toRow(data),
      status: 'approved',
      is_active: true,
      created_by: session.admin.id,
    });

    if (error) {
      errors.push(`Row ${i + 1}: ${error.message}`);
    } else {
      ok += 1;
    }
  }

  revalidatePath('/admin/opportunities');
  revalidatePath('/admin');

  return { ok, total: items.length, errors };
}
