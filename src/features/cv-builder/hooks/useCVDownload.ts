import { useCallback, useState } from 'react';
import { Alert, Platform } from 'react-native';
import { useTranslation } from 'react-i18next';

import { exportAndShareCvPdf } from '@/features/cv-builder/pdf/export-cv-pdf';
import type { CVContent } from '@/types/domain/cv';

/**
 * PDF download hook — uses the shared react-pdf ResumeDocument export path.
 */
export function useCVDownload() {
  const [generating, setGenerating] = useState(false);
  const { t } = useTranslation();

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
        Alert.alert(t('cvBuilder.download.exportFailedTitle'), result.error ?? t('cvBuilder.download.couldNotGenerate'));
        return false;
      }

      if (Platform.OS === 'web') {
        Alert.alert(t('cvBuilder.download.readyTitle'), t('cvBuilder.download.readyMessage'));
      }

      return true;
    },
    [t],
  );

  return { downloadAndShare, generating };
}
