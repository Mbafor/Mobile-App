import { useEffect, useRef } from 'react';
import { useLocalSearchParams } from 'expo-router';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { surveyApi } from '@/features/survey/services/survey.api';
import { useSurveyStore } from '@/features/survey/store/survey.store';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { getItem, setItem } from '@/utils/storage/async-storage';

/**
 * Call once from the Dashboard screen. Increments a local visit counter and,
 * from the second Dashboard visit onward, opens the survey automatically if
 * the signed-in user hasn't completed it yet. Also honours ?feedback=1 for
 * the "Give Feedback" deep link from the marketing site, which always opens
 * the survey regardless of visit count or prior completion.
 */
export function useSurveyEligibility() {
  const { user } = useAuth();
  const open = useSurveyStore((s) => s.open);
  const params = useLocalSearchParams<{ feedback?: string }>();
  const checkedRef = useRef(false);

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;

    if (params.feedback === '1') {
      open(true);
      return;
    }

    if (!user) return;

    void (async () => {
      const stored = await getItem(STORAGE_KEYS.DASHBOARD_VISIT_COUNT);
      const nextCount = (Number(stored) || 0) + 1;
      await setItem(STORAGE_KEYS.DASHBOARD_VISIT_COUNT, String(nextCount));

      if (nextCount < 2) return;

      const { completed, error } = await surveyApi.getCompletionStatus(user.id);
      if (error || completed) return;
      open(false);
    })();
  }, [user, params.feedback, open]);
}
