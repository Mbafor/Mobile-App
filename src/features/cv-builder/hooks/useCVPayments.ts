import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { queryKeys } from '@/constants/query-keys';
import {
  getDownloadProduct,
  getTemplateUnlockProduct,
  type PaymentProduct,
} from '@/features/cv-builder/constants/payments';
import {
  getTemplateDefinition,
  isTemplateFree,
  resolveTemplateId,
  type CVTemplateId,
} from '@/features/cv-builder/constants/templates';
import {
  getUnlockedTemplateIds,
  hasSuccessfulPayment,
} from '@/features/cv-builder/utils/payment-checks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserPayments, savePayment } from '@/lib/cv';
import type { CVPaymentType } from '@/types/domain/cv';

export function useCVPayments(cvId: string | undefined) {
  const { user, userEmail } = useAuth();
  const queryClient = useQueryClient();
  const userId = user?.id;

  const query = useQuery({
    queryKey: queryKeys.cv.payments(userId ?? ''),
    queryFn: async () => {
      if (!userId) throw new Error('Not signed in');
      const { data, error } = await getUserPayments(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

  const payments = query.data ?? [];
  const unlockedTemplateIds = useMemo(() => getUnlockedTemplateIds(payments), [payments]);

  const isTemplateUnlocked = useCallback(
    (templateId: string) => {
      const resolved = resolveTemplateId(templateId);
      if (isTemplateFree(resolved)) return true;
      return unlockedTemplateIds.includes(resolved);
    },
    [unlockedTemplateIds],
  );

  const hasDownloadPaid = useCallback(
    (id: string) => hasSuccessfulPayment(payments, 'download', { cvId: id }),
    [payments],
  );

  const recordPayment = useCallback(
    async (opts: {
      cvId: string;
      amount: number;
      type: CVPaymentType;
      paystackReference: string;
      templateId?: string;
    }) => {
      if (!userId) return { ok: false as const, error: 'Not signed in' };

      const { data, error } = await savePayment({
        userId,
        cvId: opts.cvId,
        amount: opts.amount,
        type: opts.type,
        status: 'success',
        paystackReference: opts.paystackReference,
        templateId: opts.templateId ?? null,
      });

      if (error || !data) {
        return { ok: false as const, error: error?.message ?? 'Failed to save payment' };
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.cv.payments(userId) });
      return { ok: true as const, payment: data };
    },
    [userId, queryClient],
  );

  const getProductForDownload = useCallback(
    (cvTitle: string): PaymentProduct => getDownloadProduct(cvTitle),
    [],
  );

  const getProductForTemplate = useCallback((templateId: CVTemplateId): PaymentProduct => {
    const def = getTemplateDefinition(templateId);
    return getTemplateUnlockProduct(def?.label ?? templateId);
  }, []);

  return {
    payments,
    unlockedTemplateIds,
    isTemplateUnlocked,
    hasDownloadPaid,
    recordPayment,
    getProductForDownload,
    getProductForTemplate,
    userEmail,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
