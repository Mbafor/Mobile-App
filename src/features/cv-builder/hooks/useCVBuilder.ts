import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { queryKeys } from '@/constants/query-keys';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import {
  DEFAULT_TEMPLATE_ID,
  isTemplateFree,
} from '@/features/cv-builder/constants/templates';
import { normalizeCVContent } from '@/features/cv-builder/utils/normalize-cv-content';
import {
  getLayoutFromContent,
  normalizeLayout,
} from '@/features/cv-builder/utils/section-config';
import { getCVById, updateCV } from '@/lib/cv';
import type { CVContent, CVLayoutConfig } from '@/types/domain/cv';
import { EMPTY_CV_CONTENT } from '@/types/domain/cv';

export type SaveIndicatorState = 'idle' | 'saving' | 'saved' | 'error';

type PersistPatch = {
  content?: CVContent;
  templateId?: string;
};

export function useCVBuilder(cvId: string | undefined) {
  const queryClient = useQueryClient();
  const [content, setContent] = useState<CVContent>(EMPTY_CV_CONTENT);
  const [templateId, setTemplateId] = useState<string>(DEFAULT_TEMPLATE_ID);
  const [activeSection, setActiveSection] = useState<CVSectionId>('personal');
  const [saveState, setSaveState] = useState<SaveIndicatorState>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const contentRef = useRef(content);
  const templateIdRef = useRef(templateId);
  contentRef.current = content;
  templateIdRef.current = templateId;

  const query = useQuery({
    queryKey: queryKeys.cv.detail(cvId ?? ''),
    queryFn: async () => {
      if (!cvId) throw new Error('Missing CV id');
      const { data, error } = await getCVById(cvId);
      if (error) throw error;
      if (!data) throw new Error('CV not found');
      return data;
    },
    enabled: Boolean(cvId),
  });

  const hydratedRef = useRef(false);

  useEffect(() => {
    hydratedRef.current = false;
  }, [cvId]);

  useEffect(() => {
    if (query.data && !hydratedRef.current) {
      setContent(normalizeCVContent(query.data.content));
      setTemplateId(query.data.templateId || DEFAULT_TEMPLATE_ID);
      hydratedRef.current = true;
    }
  }, [query.data, cvId]);

  const persist = useCallback(
    async (patch?: PersistPatch): Promise<boolean> => {
      if (!cvId) return false;
      setSaveState('saving');
      setSaveError(null);

      const payload = {
        content: patch?.content ?? contentRef.current,
        templateId: patch?.templateId ?? templateIdRef.current,
      };

      const { data, error } = await updateCV(cvId, payload);
      if (error || !data) {
        setSaveState('error');
        setSaveError(error?.message ?? 'Failed to save');
        return false;
      }

      setTemplateId(data.templateId);
      setSaveState('saved');
      void queryClient.invalidateQueries({ queryKey: queryKeys.cv.detail(cvId) });
      if (data.userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.cv.list(data.userId) });
      }
      return true;
    },
    [cvId, queryClient],
  );

  const updateContent = useCallback((updater: (prev: CVContent) => CVContent) => {
    setContent((prev) => {
      const next = updater(prev);
      contentRef.current = next;
      return next;
    });
    if (saveState === 'saved') {
      setSaveState('idle');
    }
  }, [saveState]);

  const goToSection = useCallback(
    async (section: CVSectionId) => {
      if (section === activeSection) return;
      const ok = await persist({ content: contentRef.current });
      if (ok) {
        setActiveSection(section);
      }
    },
    [activeSection, persist],
  );

  const selectTemplate = useCallback(
    async (id: string) => {
      if (!isTemplateFree(id)) {
        return;
      }
      if (id === templateIdRef.current) return;

      setTemplateId(id);
      templateIdRef.current = id;
      if (saveState === 'saved') {
        setSaveState('idle');
      }

      await persist({
        content: contentRef.current,
        templateId: id,
      });
    },
    [persist, saveState],
  );

  const saveNow = useCallback(async () => {
    await persist({
      content: contentRef.current,
      templateId: templateIdRef.current,
    });
  }, [persist]);

  const layout = getLayoutFromContent(content);

  const updateLayout = useCallback(
    (updater: (prev: CVLayoutConfig) => CVLayoutConfig) => {
      updateContent((prev) => {
        const current = getLayoutFromContent(prev);
        const nextLayout = normalizeLayout(updater(current));
        return { ...prev, layout: nextLayout };
      });
    },
    [updateContent],
  );

  const setSectionOrder = useCallback(
    (order: CVSectionId[]) => {
      updateLayout((prev) => ({ ...prev, sectionOrder: order }));
    },
    [updateLayout],
  );

  const setSectionEnabled = useCallback(
    (sectionId: CVSectionId, enabled: boolean) => {
      if (sectionId === 'personal' && !enabled) return;
      updateLayout((prev) => {
        const disabled = new Set(prev.disabledSections);
        if (enabled) {
          disabled.delete(sectionId);
        } else {
          disabled.add(sectionId);
        }
        return { ...prev, disabledSections: [...disabled] };
      });
    },
    [updateLayout],
  );

  const saveLayout = useCallback(async () => {
    return persist({ content: contentRef.current });
  }, [persist]);

  return {
    cv: query.data,
    content,
    layout,
    templateId,
    updateContent,
    updateLayout,
    setSectionOrder,
    setSectionEnabled,
    selectTemplate,
    activeSection,
    goToSection,
    saveNow,
    saveLayout,
    persist,
    saveState,
    saveError,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
