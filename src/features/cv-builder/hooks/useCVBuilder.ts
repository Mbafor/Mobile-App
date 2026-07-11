import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { CVSectionId } from '@/features/cv-builder/constants/sections';
import { DEFAULT_TEMPLATE_ID, resolveTemplateId } from '@/features/cv-builder/constants/templates';
import {
  buildProfilePrefillSource,
  mergeProfileIntoPersonalInfo,
} from '@/features/cv-builder/utils/prefill-personal-from-profile';
import { normalizeCVContent } from '@/features/cv-builder/utils/normalize-cv-content';
import { profilesApi } from '@/services/api';
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
  title?: string;
};

export function useCVBuilder(cvId: string | undefined) {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { user, profile: authProfile, userEmail } = useAuth();
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
      if (!cvId) throw new Error(t('cvBuilder.errors.missingCvId'));
      const { data, error } = await getCVById(cvId);
      if (error) throw error;
      if (!data) throw new Error(t('cvBuilder.errors.cvNotFound'));
      return data;
    },
    enabled: Boolean(cvId),
  });

  const hydratedRef = useRef(false);
  const userId = query.data?.userId ?? user?.id;

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(userId ?? ''),
    queryFn: async () => {
      const { data, error } = await profilesApi.getByUserId(userId!);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  useEffect(() => {
    hydratedRef.current = false;
  }, [cvId]);

  useEffect(() => {
    if (!query.data || hydratedRef.current) return;
    if (userId && profileQuery.isLoading) return;

    let normalized = normalizeCVContent(query.data.content);
    const prefillSource = buildProfilePrefillSource(profileQuery.data, {
      displayName: authProfile?.displayName,
      userEmail,
    });
    normalized = {
      ...normalized,
      personalInfo: mergeProfileIntoPersonalInfo(normalized.personalInfo, prefillSource),
    };

    setContent(normalized);
    setTemplateId(resolveTemplateId(query.data.templateId || DEFAULT_TEMPLATE_ID));
    hydratedRef.current = true;
  }, [query.data, cvId, userId, profileQuery.data, profileQuery.isLoading, authProfile?.displayName, userEmail]);

  const persist = useCallback(
    async (patch?: PersistPatch): Promise<boolean> => {
      if (!cvId) return false;
      setSaveState('saving');
      setSaveError(null);

      const payload: PersistPatch = {
        content: patch?.content ?? contentRef.current,
        templateId: patch?.templateId ?? templateIdRef.current,
      };
      if (patch?.title !== undefined) {
        payload.title = patch.title;
      }

      const { data, error } = await updateCV(cvId, payload);
      if (error || !data) {
        setSaveState('error');
        setSaveError(error?.message ?? t('cvBuilder.errors.failedToSave'));
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
    [cvId, queryClient, t],
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

  /** Updates the active template in the UI immediately (preview) without saving. */
  const setActiveTemplate = useCallback((id: string) => {
    const resolved = resolveTemplateId(id);
    setTemplateId(resolved);
    templateIdRef.current = resolved;
  }, []);

  const selectTemplate = useCallback(
    async (id: string) => {
      const resolved = resolveTemplateId(id);
      if (resolved === resolveTemplateId(templateIdRef.current)) {
        return { ok: true as const };
      }

      setTemplateId(resolved);
      templateIdRef.current = resolved;
      if (saveState === 'saved') {
        setSaveState('idle');
      }

      const saved = await persist({
        content: contentRef.current,
        templateId: resolved,
      });
      return saved ? { ok: true as const } : { ok: false as const };
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

  const updateTitle = useCallback(
    async (title: string) => {
      const trimmed = title.trim();
      if (!trimmed || trimmed === query.data?.title) return true;
      return persist({ title: trimmed, content: contentRef.current });
    },
    [persist, query.data?.title],
  );

  return {
    cv: query.data,
    content,
    layout,
    templateId,
    updateContent,
    updateLayout,
    setSectionOrder,
    setSectionEnabled,
    setActiveTemplate,
    selectTemplate,
    activeSection,
    goToSection,
    saveNow,
    saveLayout,
    updateTitle,
    persist,
    saveState,
    saveError,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
