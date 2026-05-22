import { useCallback, useState } from 'react';
import { Alert } from 'react-native';

import { generateCvPdf, shareCvPdf } from '@/features/cv-builder/pdf/generate-cv-pdf';
import type { CVContent } from '@/types/domain/cv';

export function useCVDownload() {
  const [generating, setGenerating] = useState(false);

  const downloadAndShare = useCallback(
    async (opts: {
      templateId: string;
      content: CVContent;
      fileName: string;
    }) => {
      setGenerating(true);
      const result = await generateCvPdf(opts.templateId, opts.content, opts.fileName);
      setGenerating(false);

      if (!result.ok) {
        Alert.alert('PDF generation failed', result.error);
        return false;
      }

      const share = await shareCvPdf(result.uri, opts.fileName);
      if (!share.ok) {
        Alert.alert('Could not share PDF', share.error ?? 'Sharing is unavailable.');
        return false;
      }

      return true;
    },
    [],
  );

  return { downloadAndShare, generating };
}
