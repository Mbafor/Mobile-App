import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';

import { exportAndShareCvPdf } from '@/features/cv-builder/pdf/export-cv-pdf';
import type { CVContent } from '@/types/domain/cv';

/**
 * PDF download hook — uses HTML template export only.
 * Preview UI (CVPreviewModal / CVTemplateRenderer) is never captured.
 */
export function useCVDownload() {
  const [generating, setGenerating] = useState(false);

  const downloadAndShare = useCallback(
    async (opts: {
      templateId: string;
      content: CVContent;
      fileName: string;
    }) => {
      setGenerating(true);
      const result = await exportAndShareCvPdf(opts);
      setGenerating(false);

      if (!result.ok) {
        Alert.alert('PDF export failed', result.error ?? 'Could not generate PDF.');
        return false;
      }

      if (Platform.OS === 'web') {
        Alert.alert('PDF ready', 'Your download should start automatically. Check your browser downloads folder.');
      }

      return true;
    },
    [],
  );

  return { downloadAndShare, generating };
}
