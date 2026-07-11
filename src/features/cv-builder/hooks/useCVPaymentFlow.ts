import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { PaymentProduct } from '@/features/cv-builder/constants/payments';
import { resolveTemplateId, type CVTemplateId } from '@/features/cv-builder/constants/templates';
import { useCVPayments } from '@/features/cv-builder/hooks/useCVPayments';
import {
  extractReferenceFromUrl,
  getPaystackRedirectUri,
  initializePaystackPayment,
  verifyPaystackPayment,
} from '@/services/paystack/paystack';
import type { CVPaymentType } from '@/types/domain/cv';

WebBrowser.maybeCompleteAuthSession();

type PendingPayment = {
  product: PaymentProduct;
  cvId: string;
  templateId: CVTemplateId;
  onSuccess: () => void | Promise<void>;
};

export function useCVPaymentFlow(cvId: string | undefined) {
  const { t } = useTranslation();
  const payments = useCVPayments(cvId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<PendingPayment | null>(null);

  const closeAll = useCallback(() => {
    setSheetVisible(false);
    pendingRef.current = null;
  }, []);

  const runSuccess = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;
    try {
      await pending.onSuccess();
    } finally {
      closeAll();
    }
  }, [closeAll]);

  const promptPayment = useCallback(
    (opts: {
      product: PaymentProduct;
      cvId: string;
      templateId: string;
      onSuccess: () => void | Promise<void>;
    }) => {
      const templateId = resolveTemplateId(opts.templateId);

      if (payments.isTemplatePurchased(templateId)) {
        void opts.onSuccess();
        return;
      }

      pendingRef.current = {
        product: opts.product,
        cvId: opts.cvId,
        templateId,
        onSuccess: opts.onSuccess,
      };
      setSheetVisible(true);
    },
    [payments],
  );

  const handleCheckoutFailure = useCallback((message: string, cancelled?: boolean) => {
    if (!cancelled) {
      Alert.alert(t('cvBuilder.paymentFlow.paymentFailedTitle'), message);
    }
    setSheetVisible(true);
  }, [t]);

  const handleCheckoutSuccess = useCallback(
    async (reference: string) => {
      const pending = pendingRef.current;
      if (!pending) return;

      setBusy(true);

      const verified = await verifyPaystackPayment(reference);
      if (!verified.ok) {
        setBusy(false);
        Alert.alert(
          verified.cancelled ? t('cvBuilder.paymentFlow.paymentCancelledTitle') : t('cvBuilder.paymentFlow.paymentFailedTitle'),
          verified.error,
        );
        setSheetVisible(true);
        return;
      }

      const templateId = resolveTemplateId(
        verified.templateId ?? pending.templateId,
      );

      const record = await payments.recordPayment({
        cvId: pending.cvId,
        amount: verified.amount,
        type: 'template_unlock' as CVPaymentType,
        paystackReference: verified.reference,
        templateId,
      });

      setBusy(false);

      if (!record.ok) {
        Alert.alert(
          t('cvBuilder.paymentFlow.paymentReceivedTitle'),
          t('cvBuilder.paymentFlow.paymentReceivedMessage'),
        );
      }

      await runSuccess();
    },
    [payments, runSuccess, t],
  );

  const handlePayPress = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;

    const email = payments.userEmail;
    if (!email) {
      Alert.alert(t('cvBuilder.paymentFlow.signInRequiredTitle'), t('cvBuilder.paymentFlow.signInRequiredMessage'));
      return;
    }

    setBusy(true);
    const init = await initializePaystackPayment({
      email,
      amountGhs: pending.product.amountGhs,
      cvId: pending.cvId,
      paymentType: 'template_unlock',
      templateId: pending.templateId,
    });

    if (!init.ok) {
      setBusy(false);
      Alert.alert(t('cvBuilder.paymentFlow.paymentUnavailableTitle'), init.error);
      return;
    }

    setSheetVisible(false);

    const redirectUri = getPaystackRedirectUri();
    const result = await WebBrowser.openAuthSessionAsync(init.authorizationUrl, redirectUri, {
      showInRecents: true,
    });

    setBusy(false);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      handleCheckoutFailure(t('cvBuilder.paystack.paymentCancelled'), true);
      return;
    }

    if (result.type === 'success' && result.url) {
      const reference = extractReferenceFromUrl(result.url) ?? init.reference;
      await handleCheckoutSuccess(reference);
      return;
    }

    handleCheckoutFailure(t('cvBuilder.paymentFlow.paymentIncomplete'));
  }, [payments.userEmail, handleCheckoutSuccess, handleCheckoutFailure, t]);

  return {
    ...payments,
    sheetVisible,
    busy,
    pendingProduct: pendingRef.current?.product ?? null,
    promptPayment,
    handlePayPress,
    closePaymentSheet: () => {
      pendingRef.current = null;
      setSheetVisible(false);
    },
  };
}
