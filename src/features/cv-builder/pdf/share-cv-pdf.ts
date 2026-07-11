import { Platform } from 'react-native';
import i18n from '@/i18n';

/**
 * Saves or shares a generated PDF. Web triggers a direct download (blob URL);
 * native uses the system share sheet.
 */
export async function shareCvPdf(
  uri: string,
  fileName: string,
): Promise<{ ok: boolean; error?: string }> {
  if (Platform.OS === 'web') {
    const { shareCvPdfInBrowser } = await import('@/features/cv-builder/pdf/share-cv-pdf-browser');
    return shareCvPdfInBrowser(uri, fileName);
  }

  const Sharing = await import('expo-sharing');

  try {
    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
      return { ok: false, error: i18n.t('cvBuilder.pdfErrors.sharingNotAvailableDevice') };
    }

    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: i18n.t('cvBuilder.pdfErrors.saveFileName', { fileName }),
      UTI: 'com.adobe.pdf',
    });

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : i18n.t('cvBuilder.pdfErrors.failedToShare');
    return { ok: false, error: message };
  }
}
