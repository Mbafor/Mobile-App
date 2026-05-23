import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import type { CVPayment } from '@/types/domain/cv';

/** True when this user has permanently purchased download access for one template. */
export function isTemplatePurchased(payments: CVPayment[], templateId: string): boolean {
  const resolved = resolveTemplateId(templateId);
  return payments.some(
    (p) =>
      p.status === 'success' &&
      p.type === 'template_unlock' &&
      p.templateId != null &&
      resolveTemplateId(p.templateId) === resolved,
  );
}

/** Distinct template IDs the user has purchased (per-user, not global). */
export function getPurchasedTemplateIds(payments: CVPayment[]): CVTemplateId[] {
  const ids = payments
    .filter((p) => p.status === 'success' && p.type === 'template_unlock' && p.templateId)
    .map((p) => resolveTemplateId(p.templateId!));
  return [...new Set(ids)];
}
