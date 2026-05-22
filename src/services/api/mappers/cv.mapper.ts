import { normalizeCVContent } from '@/features/cv-builder/utils/normalize-cv-content';
import type { CVRow, CVPaymentRow } from '@/services/supabase/types';
import type { CV, CVPayment } from '@/types/domain/cv';

function parseCVContent(raw: unknown) {
  return normalizeCVContent(raw);
}

export function mapCVRow(row: CVRow): CV {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    templateId: row.template_id,
    content: parseCVContent(row.content),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapCVPaymentRow(row: CVPaymentRow): CVPayment {
  return {
    id: row.id,
    userId: row.user_id,
    cvId: row.cv_id,
    amount: Number(row.amount),
    type: row.type,
    status: row.status,
    paystackReference: row.paystack_reference,
    templateId: row.template_id ?? null,
    createdAt: row.created_at,
  };
}
