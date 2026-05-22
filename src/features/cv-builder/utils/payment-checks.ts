import { resolveTemplateId } from '@/features/cv-builder/constants/templates';
import type { CVPayment, CVPaymentType } from '@/types/domain/cv';

export function hasSuccessfulPayment(
  payments: CVPayment[],
  type: CVPaymentType,
  opts?: { cvId?: string; templateId?: string },
): boolean {
  return payments.some((p) => {
    if (p.status !== 'success' || p.type !== type) return false;
    if (opts?.cvId && p.cvId !== opts.cvId) return false;
    if (type === 'template_unlock' && opts?.templateId) {
      const resolved = resolveTemplateId(opts.templateId);
      return p.templateId === resolved;
    }
    return true;
  });
}

export function getUnlockedTemplateIds(payments: CVPayment[]): string[] {
  return payments
    .filter((p) => p.status === 'success' && p.type === 'template_unlock' && p.templateId)
    .map((p) => resolveTemplateId(p.templateId!));
}
