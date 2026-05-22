import type { CVPaymentType } from '@/types/domain/cv';

/** GHS amount charged for PDF download (per CV). */
export const CV_DOWNLOAD_FEE_GHS = 100;

/** GHS amount charged to permanently unlock any template layout. */
export const CV_TEMPLATE_UNLOCK_FEE_GHS = 100;

export type PaymentProduct = {
  type: CVPaymentType;
  amountGhs: number;
  title: string;
  description: string;
};

export function getDownloadProduct(cvTitle: string): PaymentProduct {
  return {
    type: 'download',
    amountGhs: CV_DOWNLOAD_FEE_GHS,
    title: 'Download your CV',
    description: `Pay once to export "${cvTitle}" as a PDF. You won't be charged again for this CV.`,
  };
}

export function getTemplateUnlockProduct(templateLabel: string): PaymentProduct {
  return {
    type: 'template_unlock',
    amountGhs: CV_TEMPLATE_UNLOCK_FEE_GHS,
    title: `Unlock ${templateLabel}`,
    description: `Pay once to use the ${templateLabel} layout on all your CVs — permanently.`,
  };
}

/** Paystack amounts are in pesewas (GHS × 100). */
export function ghsToKobo(amountGhs: number): number {
  return Math.round(amountGhs * 100);
}
