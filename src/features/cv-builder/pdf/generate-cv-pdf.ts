import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { renderCvHtml } from '@/features/cv-builder/pdf/html';
import type { CVContent } from '@/types/domain/cv';

export type GeneratePdfResult =
  | { ok: true; uri: string }
  | { ok: false; error: string };

export async function generateCvPdf(
  templateId: string,
  content: CVContent,
  fileName: string,
): Promise<GeneratePdfResult> {
  try {
    const html = renderCvHtml(templateId, content);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (!uri) {
      return { ok: false, error: 'PDF generation returned no file.' };
    }

    return { ok: true, uri };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to generate PDF';
    return { ok: false, error: message };
  }
}

export async function shareCvPdf(uri: string, fileName: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { ok: false, error: 'Sharing is not available on this device.' };
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Save ${fileName}`,
      UTI: 'com.adobe.pdf',
    });

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to share PDF';
    return { ok: false, error: message };
  }
}
