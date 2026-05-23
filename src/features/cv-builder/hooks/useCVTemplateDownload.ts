import { useCallback } from 'react';

import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { useCVPaymentContext } from '@/features/cv-builder/context/CVPaymentContext';
import { resolveTemplateId } from '@/features/cv-builder/constants/templates';
import { useCVDownload } from '@/features/cv-builder/hooks/useCVDownload';

/**
 * Download flow: preview is always free; Paystack only when downloading
 * a template the user has not purchased yet (per-template, per-user).
 */
export function useCVTemplateDownload() {
  const { cv, content, saveNow } = useCVBuilderContext();
  const payment = useCVPaymentContext();
  const { downloadAndShare, generating } = useCVDownload();

  const downloadWithTemplate = useCallback(
    (downloadTemplateId: string) => {
      if (!cv) return;

      const templateId = resolveTemplateId(downloadTemplateId);

      const runPdfDownload = async () => {
        await saveNow();
        const fileName = `${cv.title.trim() || 'My-CV'}.pdf`;
        await downloadAndShare({ templateId, content, fileName });
      };

      if (payment.isTemplatePurchased(templateId)) {
        void runPdfDownload();
        return;
      }

      payment.promptPayment({
        product: payment.getProductForTemplate(templateId),
        cvId: cv.id,
        templateId,
        onSuccess: runPdfDownload,
      });
    },
    [cv, content, downloadAndShare, payment, saveNow],
  );

  return {
    downloadWithTemplate,
    isDownloading: generating || payment.busy,
  };
}
