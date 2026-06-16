import { makeRedirectUri } from 'expo-auth-session';

import { ghsToKobo } from '@/features/cv-builder/constants/payments';
import { supabase } from '@/services/supabase/client';
import type { CVPaymentType } from '@/types/domain/cv';

/** Must match Paystack `callback_url` and `WebBrowser.openAuthSessionAsync` redirect. */
export function getPaystackRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'Voila',
    path: 'paystack-callback',
  });
}

export type InitializePaymentParams = {
  email: string;
  amountGhs: number;
  cvId: string;
  paymentType: CVPaymentType;
  templateId?: string;
};

export type InitializePaymentResult =
  | { ok: true; authorizationUrl: string; reference: string }
  | { ok: false; error: string };

export type VerifyPaymentResult =
  | {
      ok: true;
      reference: string;
      amount: number;
      cvId: string;
      paymentType: CVPaymentType;
      templateId: string | null;
    }
  | { ok: false; error: string; cancelled?: boolean };

export async function initializePaystackPayment(
  params: InitializePaymentParams,
): Promise<InitializePaymentResult> {
  const { data, error } = await supabase.functions.invoke('paystack-initialize', {
    body: {
      email: params.email,
      amount: ghsToKobo(params.amountGhs),
      cvId: params.cvId,
      paymentType: params.paymentType,
      templateId: params.templateId ?? null,
      callbackUrl: getPaystackRedirectUri(),
    },
  });

  if (error) {
    return {
      ok: false,
      error:
        error.message?.includes('Function not found') || error.message?.includes('404')
          ? 'Payment service is not deployed yet. Ask your admin to deploy the Paystack edge functions.'
          : error.message ?? 'Could not start payment',
    };
  }

  if (data?.error) {
    return { ok: false, error: data.error };
  }

  if (!data?.authorizationUrl || !data?.reference) {
    return { ok: false, error: 'Invalid response from payment service' };
  }

  return {
    ok: true,
    authorizationUrl: data.authorizationUrl,
    reference: data.reference,
  };
}

export async function verifyPaystackPayment(reference: string): Promise<VerifyPaymentResult> {
  const { data, error } = await supabase.functions.invoke('paystack-verify', {
    body: { reference },
  });

  if (error) {
    return { ok: false, error: error.message ?? 'Could not verify payment' };
  }

  if (data?.error) {
    return { ok: false, error: data.error };
  }

  if (!data?.success) {
    return {
      ok: false,
      error: data?.message ?? 'Payment was not completed',
      cancelled: data?.status === 'abandoned',
    };
  }

  return {
    ok: true,
    reference: data.reference,
    amount: data.amount,
    cvId: data.cvId,
    paymentType: data.paymentType,
    templateId: data.templateId,
  };
}

export function extractReferenceFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    return (
      parsed.searchParams.get('reference') ??
      parsed.searchParams.get('trxref') ??
      null
    );
  } catch {
    const match = url.match(/[?&](?:reference|trxref)=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
  }
}
