import { Platform } from 'react-native';

import { assertCvDocumentHtml } from '@/features/cv-builder/pdf/assert-cv-html';

/** A4 width in points (72 pt per inch). */
const PDF_WIDTH_PT = 595;
const PDF_HEIGHT_PT = 842;

const PDF_MARGINS = {
  top: 36,
  bottom: 36,
  left: 36,
  right: 36,
};

/**
 * Renders structured CV HTML to a PDF file URI (native) or blob URL (web).
 * Web never loads expo-print — its printToFileAsync calls window.print(), which
 * triggers Chrome print-preview Trusted Types errors.
 */
export async function renderHtmlToPdfFile(html: string): Promise<string> {
  assertCvDocumentHtml(html);

  if (Platform.OS === 'web') {
    const { renderHtmlToPdfInBrowser } = await import(
      '@/features/cv-builder/pdf/render-html-to-pdf-browser'
    );
    return renderHtmlToPdfInBrowser(html);
  }

  const Print = await import('expo-print');
  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
    width: PDF_WIDTH_PT,
    height: PDF_HEIGHT_PT,
    margins: PDF_MARGINS,
  });

  if (!uri) {
    throw new Error('PDF generation returned no file.');
  }

  return uri;
}
