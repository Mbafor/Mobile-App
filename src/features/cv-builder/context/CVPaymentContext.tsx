import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { CVPaymentSheet } from '@/features/cv-builder/components/payments/CVPaymentSheet';
import { useCVPaymentFlow } from '@/features/cv-builder/hooks/useCVPaymentFlow';

type CVPaymentContextValue = ReturnType<typeof useCVPaymentFlow>;

const CVPaymentContext = createContext<CVPaymentContextValue | null>(null);

type CVPaymentProviderProps = PropsWithChildren<{
  cvId: string;
}>;

export function CVPaymentProvider({ cvId, children }: CVPaymentProviderProps) {
  const flow = useCVPaymentFlow(cvId);

  return (
    <CVPaymentContext.Provider value={flow}>
      {children}
      <CVPaymentSheet
        visible={flow.sheetVisible}
        product={flow.pendingProduct}
        loading={flow.busy}
        onClose={flow.closePaymentSheet}
        onPay={() => void flow.handlePayPress()}
      />
    </CVPaymentContext.Provider>
  );
}

export function useCVPaymentContext(): CVPaymentContextValue {
  const ctx = useContext(CVPaymentContext);
  if (!ctx) {
    throw new Error('useCVPaymentContext must be used within CVPaymentProvider');
  }
  return ctx;
}
