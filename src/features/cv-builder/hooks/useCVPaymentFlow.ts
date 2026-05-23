import * as WebBrowser from 'expo-web-browser';
import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

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
      Alert.alert('Payment failed', message);
    }
    setSheetVisible(true);
  }, []);

  const handleCheckoutSuccess = useCallback(
    async (reference: string) => {
      const pending = pendingRef.current;
      if (!pending) return;

      setBusy(true);

      const verified = await verifyPaystackPayment(reference);
      if (!verified.ok) {
        setBusy(false);
        Alert.alert(
          verified.cancelled ? 'Payment cancelled' : 'Payment failed',
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
          'Payment received',
          'Your payment succeeded but we could not save the record. Please contact support if you are charged again.',
        );
      }

      await runSuccess();
    },
    [payments, runSuccess],
  );

  const handlePayPress = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;

    const email = payments.userEmail;
    if (!email) {
      Alert.alert('Sign in required', 'Please sign in with an email address to pay.');
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
      Alert.alert('Payment unavailable', init.error);
      return;
    }

    setSheetVisible(false);

    const redirectUri = getPaystackRedirectUri();
    const result = await WebBrowser.openAuthSessionAsync(init.authorizationUrl, redirectUri, {
      showInRecents: true,
    });

    setBusy(false);

    if (result.type === 'cancel' || result.type === 'dismiss') {
      handleCheckoutFailure('Payment was cancelled', true);
      return;
    }

    if (result.type === 'success' && result.url) {
      const reference = extractReferenceFromUrl(result.url) ?? init.reference;
      await handleCheckoutSuccess(reference);
      return;
    }

    handleCheckoutFailure('Payment did not complete. Please try again.');
  }, [payments.userEmail, handleCheckoutSuccess, handleCheckoutFailure]);

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
