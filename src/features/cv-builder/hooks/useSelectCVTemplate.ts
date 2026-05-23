import { useCallback } from 'react';

import { useCVBuilderContext } from '@/features/cv-builder/context/CVBuilderContext';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';

/** Select a layout and save it — no payment required (payment is on PDF download only). */
export function useSelectCVTemplate() {
  const { selectTemplate } = useCVBuilderContext();

  const selectCVTemplate = useCallback(
    (id: CVTemplateId) => {
      void selectTemplate(resolveTemplateId(id));
    },
    [selectTemplate],
  );

  return { selectCVTemplate };
}
