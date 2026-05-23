import { renderCvHtml } from '@/features/cv-builder/pdf/html';
import { renderHtmlToPdfFile } from '@/features/cv-builder/pdf/render-html-to-pdf';
import { shareCvPdf } from '@/features/cv-builder/pdf/share-cv-pdf';
import type { CVContent } from '@/types/domain/cv';

export type ExportCvPdfResult =
  | { ok: true; uri: string }
  | { ok: false; error: string };

export type ExportCvPdfOptions = {
  templateId: string;
  content: CVContent;
  fileName: string;
};

/**
 * Builds a standalone HTML CV document from structured data + template layout.
 * Preview UI components are never involved in this pipeline.
 */
export function buildCvPdfHtml(templateId: string, content: CVContent): string {
  return renderCvHtml(templateId, content);
}

/** Generates a PDF file from structured CV data (HTML/CSS templates only). */
export async function exportCvToPdf(options: ExportCvPdfOptions): Promise<ExportCvPdfResult> {
  try {
    const html = buildCvPdfHtml(options.templateId, options.content);
    const uri = await renderHtmlToPdfFile(html);
    return { ok: true, uri };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to generate PDF';
    return { ok: false, error: message };
  }
}

export async function exportAndShareCvPdf(
  options: ExportCvPdfOptions,
): Promise<{ ok: boolean; error?: string }> {
  const result = await exportCvToPdf(options);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  const share = await shareCvPdf(result.uri, options.fileName);
  if (!share.ok) {
    return { ok: false, error: share.error ?? 'Sharing is unavailable.' };
  }

  return { ok: true };
}
