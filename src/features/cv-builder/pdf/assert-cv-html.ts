/** Validates standalone CV HTML before PDF generation (not app preview markup). */
export function assertCvDocumentHtml(html: string): void {
  const trimmed = html.trim();
  if (!trimmed.startsWith('<!DOCTYPE html') && !trimmed.startsWith('<html')) {
    throw new Error('PDF export requires a complete HTML document.');
  }
  if (!/\bclass=["']page\b/.test(trimmed)) {
    throw new Error('PDF export HTML is missing CV page content.');
  }
  if (trimmed.includes('Download PDF') || trimmed.includes('Preview CV')) {
    throw new Error('PDF export must not include app UI markup.');
  }
}
