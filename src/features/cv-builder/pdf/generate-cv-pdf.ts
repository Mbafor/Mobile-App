/**
 * @deprecated Use exportCvToPdf from export-cv-pdf.ts — kept for backward compatibility.
 */
import { exportCvToPdf, type ExportCvPdfResult } from '@/features/cv-builder/pdf/export-cv-pdf';
import { shareCvPdf } from '@/features/cv-builder/pdf/share-cv-pdf';
import type { CVContent } from '@/types/domain/cv';

export type GeneratePdfResult = ExportCvPdfResult;

export { shareCvPdf };

export async function generateCvPdf(
  templateId: string,
  content: CVContent,
  _fileName: string,
): Promise<GeneratePdfResult> {
  return exportCvToPdf({ templateId, content, fileName: _fileName });
}
