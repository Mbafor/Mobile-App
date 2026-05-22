import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';

import type { PaymentProduct } from '@/features/cv-builder/constants/payments';
import { useCVPayments } from '@/features/cv-builder/hooks/useCVPayments';
import {
  initializePaystackPayment,
  verifyPaystackPayment,
} from '@/services/paystack/paystack';
import type { CVPaymentType } from '@/types/domain/cv';

type PendingPayment = {
  product: PaymentProduct;
  cvId: string;
  templateId?: string;
  alreadyPaid: boolean;
  onSuccess: () => void | Promise<void>;
};

export function useCVPaymentFlow(cvId: string | undefined) {
  const payments = useCVPayments(cvId);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const pendingRef = useRef<PendingPayment | null>(null);

  const closeAll = useCallback(() => {
    setSheetVisible(false);
    setCheckoutVisible(false);
    setCheckoutUrl('');
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
      templateId?: string;
      alreadyPaid?: boolean;
      onSuccess: () => void | Promise<void>;
    }) => {
      pendingRef.current = {
        product: opts.product,
        cvId: opts.cvId,
        templateId: opts.templateId,
        alreadyPaid: opts.alreadyPaid ?? false,
        onSuccess: opts.onSuccess,
      };
      setSheetVisible(true);
    },
    [],
  );

  const handlePayPress = useCallback(async () => {
    const pending = pendingRef.current;
    if (!pending) return;

    if (pending.alreadyPaid) {
      await runSuccess();
      return;
    }

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
      paymentType: pending.product.type,
      templateId: pending.templateId,
    });
    setBusy(false);

    if (!init.ok) {
      Alert.alert('Payment unavailable', init.error);
      return;
    }

    setSheetVisible(false);
    setCheckoutUrl(init.authorizationUrl);
    setCheckoutVisible(true);
  }, [payments.userEmail, runSuccess]);

  const handleCheckoutSuccess = useCallback(
    async (reference: string) => {
      const pending = pendingRef.current;
      if (!pending) return;

      setCheckoutVisible(false);
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

      const record = await payments.recordPayment({
        cvId: pending.cvId,
        amount: verified.amount,
        type: verified.paymentType as CVPaymentType,
        paystackReference: verified.reference,
        templateId: verified.templateId ?? pending.templateId,
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

  const handleCheckoutFailure = useCallback((message: string, cancelled?: boolean) => {
    setCheckoutVisible(false);
    if (!cancelled) {
      Alert.alert('Payment failed', message);
    }
    setSheetVisible(true);
  }, []);

  return {
    ...payments,
    sheetVisible,
    checkoutVisible,
    checkoutUrl,
    busy,
    pendingProduct: pendingRef.current?.product ?? null,
    pendingAlreadyPaid: pendingRef.current?.alreadyPaid ?? false,
    promptPayment,
    handlePayPress,
    handleCheckoutSuccess,
    handleCheckoutFailure,
    closePaymentSheet: () => {
      pendingRef.current = null;
      setSheetVisible(false);
    },
  };
}
