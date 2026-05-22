import { mapCVPaymentRow, mapCVRow } from '@/services/api/mappers/cv.mapper';
import { supabase } from '@/services/supabase/client';
import type {
  CV,
  CVContent,
  CVPayment,
  CVPaymentStatus,
  CVPaymentType,
} from '@/types/domain/cv';
import { EMPTY_CV_CONTENT } from '@/types/domain/cv';

export type UpdateCVData = {
  title?: string;
  templateId?: string;
  content?: CVContent;
};

export type SavePaymentData = {
  userId: string;
  cvId: string;
  amount: number;
  type: CVPaymentType;
  status?: CVPaymentStatus;
  paystackReference?: string | null;
};

type ApiResult<T> = { data: T; error: null } | { data: null; error: Error };

function toError(error: { message: string } | null): Error | null {
  return error ? new Error(error.message) : null;
}

export async function createCV(userId: string, title: string): Promise<ApiResult<CV>> {
  const { data, error } = await supabase
    .from('cvs')
    .insert({
      user_id: userId,
      title: title.trim() || 'My CV',
      template_id: 'ats',
      content: EMPTY_CV_CONTENT,
    })
    .select('*')
    .single();

  const err = toError(error);
  if (err || !data) return { data: null, error: err ?? new Error('Failed to create CV') };
  return { data: mapCVRow(data), error: null };
}

export async function getUserCVs(userId: string): Promise<ApiResult<CV[]>> {
  const { data, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  const err = toError(error);
  if (err) return { data: null, error: err };
  return { data: (data ?? []).map(mapCVRow), error: null };
}

export async function getCVById(cvId: string): Promise<ApiResult<CV>> {
  const { data, error } = await supabase.from('cvs').select('*').eq('id', cvId).maybeSingle();

  const err = toError(error);
  if (err) return { data: null, error: err };
  if (!data) return { data: null, error: new Error('CV not found') };
  return { data: mapCVRow(data), error: null };
}

export async function updateCV(cvId: string, data: UpdateCVData): Promise<ApiResult<CV>> {
  const row: {
    title?: string;
    template_id?: string;
    content?: CVContent;
  } = {};

  if (data.title !== undefined) row.title = data.title.trim();
  if (data.templateId !== undefined) row.template_id = data.templateId;
  if (data.content !== undefined) row.content = data.content;

  const { data: updated, error } = await supabase
    .from('cvs')
    .update(row)
    .eq('id', cvId)
    .select('*')
    .single();

  const err = toError(error);
  if (err || !updated) return { data: null, error: err ?? new Error('Failed to update CV') };
  return { data: mapCVRow(updated), error: null };
}

export async function deleteCV(cvId: string): Promise<ApiResult<true>> {
  const { error } = await supabase.from('cvs').delete().eq('id', cvId);

  const err = toError(error);
  if (err) return { data: null, error: err };
  return { data: true, error: null };
}

export async function savePayment(paymentData: SavePaymentData): Promise<ApiResult<CVPayment>> {
  const { data, error } = await supabase
    .from('cv_payments')
    .insert({
      user_id: paymentData.userId,
      cv_id: paymentData.cvId,
      amount: paymentData.amount,
      type: paymentData.type,
      status: paymentData.status ?? 'pending',
      paystack_reference: paymentData.paystackReference ?? null,
    })
    .select('*')
    .single();

  const err = toError(error);
  if (err || !data) return { data: null, error: err ?? new Error('Failed to save payment') };
  return { data: mapCVPaymentRow(data), error: null };
}

export async function getUserPayments(userId: string): Promise<ApiResult<CVPayment[]>> {
  const { data, error } = await supabase
    .from('cv_payments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  const err = toError(error);
  if (err) return { data: null, error: err };
  return { data: (data ?? []).map(mapCVPaymentRow), error: null };
}

/** Duplicate an existing CV for the same user. */
export async function duplicateCV(userId: string, source: CV): Promise<ApiResult<CV>> {
  const { data: created, error: createError } = await createCV(
    userId,
    `${source.title.trim()} (Copy)`,
  );
  if (createError || !created) {
    return { data: null, error: createError ?? new Error('Failed to duplicate CV') };
  }

  return updateCV(created.id, {
    templateId: source.templateId,
    content: source.content,
  });
}
