import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { queryKeys } from '@/constants/query-keys';
import {
  getTemplateDownloadProduct,
  type PaymentProduct,
} from '@/features/cv-builder/constants/payments';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import {
  getPurchasedTemplateIds,
  isTemplatePurchased,
} from '@/features/cv-builder/utils/payment-checks';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { getUserPayments, savePayment } from '@/lib/cv';
import type { CVPaymentType } from '@/types/domain/cv';

export function useCVPayments(_cvId: string | undefined) {
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
  const purchasedTemplateIds = useMemo(() => getPurchasedTemplateIds(payments), [payments]);

  const checkTemplatePurchased = useCallback(
    (templateId: string) => isTemplatePurchased(payments, templateId),
    [payments],
  );

  const recordPayment = useCallback(
    async (opts: {
      cvId: string;
      amount: number;
      type: CVPaymentType;
      paystackReference: string;
      templateId: string;
    }) => {
      if (!userId) return { ok: false as const, error: 'Not signed in' };

      const { data, error } = await savePayment({
        userId,
        cvId: opts.cvId,
        amount: opts.amount,
        type: opts.type,
        status: 'success',
        paystackReference: opts.paystackReference,
        templateId: resolveTemplateId(opts.templateId),
      });

      if (error || !data) {
        return { ok: false as const, error: error?.message ?? 'Failed to save payment' };
      }

      await queryClient.invalidateQueries({ queryKey: queryKeys.cv.payments(userId) });
      return { ok: true as const, payment: data };
    },
    [userId, queryClient],
  );

  const getProductForTemplate = useCallback((templateId: CVTemplateId): PaymentProduct => {
    return getTemplateDownloadProduct(resolveTemplateId(templateId));
  }, []);

  return {
    payments,
    purchasedTemplateIds,
    isTemplatePurchased: checkTemplatePurchased,
    recordPayment,
    getProductForTemplate,
    userEmail,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
