import i18n from '@/i18n';

/** Validates standalone CV HTML before PDF generation (not app preview markup). */
export function assertCvDocumentHtml(html: string): void {
  const trimmed = html.trim();
  if (!trimmed.startsWith('<!DOCTYPE html') && !trimmed.startsWith('<html')) {
    throw new Error(i18n.t('cvBuilder.pdfErrors.incompleteHtml'));
  }
  if (!/\bclass=["']page\b/.test(trimmed)) {
    throw new Error(i18n.t('cvBuilder.pdfErrors.missingPageContent'));
  }
  if (trimmed.includes('Download PDF') || trimmed.includes('Preview CV')) {
    throw new Error(i18n.t('cvBuilder.pdfErrors.appUiMarkup'));
  }
}
