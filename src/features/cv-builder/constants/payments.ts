import type { CVTemplateId } from '@/features/cv-builder/constants/templates';
import { getTemplateDefinition } from '@/features/cv-builder/constants/templates';
import type { CVPaymentType } from '@/types/domain/cv';
import i18n from '@/i18n';

/** GHS amount charged to permanently unlock one template for PDF download. */
export const CV_TEMPLATE_UNLOCK_FEE_GHS = 100;

/** @deprecated Use CV_TEMPLATE_UNLOCK_FEE_GHS — kept for copy references */
export const CV_DOWNLOAD_FEE_GHS = CV_TEMPLATE_UNLOCK_FEE_GHS;

export type PaymentProduct = {
  type: CVPaymentType;
  amountGhs: number;
  title: string;
  description: string;
};

/** Paystack product shown when downloading with a template the user has not purchased yet. */
export function getTemplateDownloadProduct(templateId: CVTemplateId): PaymentProduct {
  const def = getTemplateDefinition(templateId);
  const label = def?.label ?? templateId;

  return {
    type: 'template_unlock',
    amountGhs: CV_TEMPLATE_UNLOCK_FEE_GHS,
    title: i18n.t('cvBuilder.payments.unlockTitle', { template: label }),
    description: i18n.t('cvBuilder.payments.unlockDescription', { template: label }),
  };
}

/** Paystack amounts are in pesewas (GHS × 100). */
export function ghsToKobo(amountGhs: number): number {
  return Math.round(amountGhs * 100);
}
