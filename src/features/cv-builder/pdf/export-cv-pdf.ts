import { pdf } from '@react-pdf/renderer';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';

import { createResumeDocumentElement } from '@/features/cv-builder/pdf/resume/ResumeDocument';
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

function sanitizeFileName(fileName: string): string {
  const trimmed = fileName.trim() || 'My-CV.pdf';
  return trimmed.endsWith('.pdf') ? trimmed : `${trimmed}.pdf`;
}

async function writePdfBlobToUri(blob: Blob, fileName: string): Promise<string> {
  if (Platform.OS === 'web') {
    return URL.createObjectURL(blob);
  }

  const base64 = await blobToBase64(blob);
  const file = new File(Paths.cache, sanitizeFileName(fileName));
  file.write(base64, { encoding: 'base64' });
  return file.uri;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Could not read PDF blob'));
        return;
      }
      const base64 = result.split(',')[1];
      if (!base64) {
        reject(new Error('Could not encode PDF'));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error('Could not read PDF blob'));
    reader.readAsDataURL(blob);
  });
}

/** Generates a PDF file from the shared react-pdf ResumeDocument. */
export async function exportCvToPdf(options: ExportCvPdfOptions): Promise<ExportCvPdfResult> {
  try {
    const document = createResumeDocumentElement(options.content, options.templateId);
    const blob = await pdf(document).toBlob();
    const uri = await writePdfBlobToUri(blob, options.fileName);
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

  const share = await shareCvPdf(result.uri, sanitizeFileName(options.fileName));
  if (!share.ok) {
    return { ok: false, error: share.error ?? 'Sharing is unavailable.' };
  }

  return { ok: true };
}
