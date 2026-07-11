import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/features/auth/hooks/useAuth';

type BugPayload = { title: string; description: string; screenshot_url?: string };
type FeaturePayload = { title: string; description: string };
type FeedbackPayload = { rating: number; comment: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export function useSubmitBug() {
  const { user } = useAuth();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (payload: BugPayload) => {
      const { error } = await db
        .from('bugs')
        .insert({ ...payload, user_id: user?.id ?? null });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      Alert.alert(t('help.submit.bugSuccessTitle'), t('help.submit.bugSuccessMessage')),
    onError: (e: Error) => Alert.alert(t('help.submit.errorTitle'), e.message),
  });
}

export function useSubmitFeatureRequest() {
  const { user } = useAuth();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (payload: FeaturePayload) => {
      const { error } = await db
        .from('feature_requests')
        .insert({ ...payload, user_id: user?.id ?? null });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      Alert.alert(t('help.submit.featureSuccessTitle'), t('help.submit.featureSuccessMessage')),
    onError: (e: Error) => Alert.alert(t('help.submit.errorTitle'), e.message),
  });
}

export function useSubmitFeedback() {
  const { user } = useAuth();
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (payload: FeedbackPayload) => {
      const { error } = await db
        .from('feedback')
        .insert({ ...payload, user_id: user?.id ?? null });
      if (error) throw new Error(error.message);
    },
    onSuccess: () =>
      Alert.alert(t('help.submit.feedbackSuccessTitle'), t('help.submit.feedbackSuccessMessage')),
    onError: (e: Error) => Alert.alert(t('help.submit.errorTitle'), e.message),
  });
}

/** Upload a local image URI to Supabase storage. Returns public URL or null on failure. */
export async function uploadScreenshot(uri: string): Promise<string | null> {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
    const fileName = `screenshot-${Date.now()}.${ext}`;
    const { data, error } = await supabase.storage
      .from('bug-screenshots')
      .upload(fileName, blob, { contentType: `image/${ext}`, upsert: false });
    if (error || !data) return null;
    const { data: urlData } = supabase.storage
      .from('bug-screenshots')
      .getPublicUrl(data.path);
    return urlData.publicUrl ?? null;
  } catch {
    return null;
  }
}
