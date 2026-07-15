'use client';

import { useEffect, useState } from 'react';

import { verifyPartnerOtp, resendPartnerOtp } from './actions';

const RESEND_COOLDOWN_SEC = 60;

export function PartnerOtpForm({ email, org }: { email: string; org: string }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  return (
    <>
      <form action={verifyPartnerOtp} className="space-y-4">
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="org" value={org} />
        <div>
          <label htmlFor="code" className="block text-sm font-medium mb-1">
            6-digit code
          </label>
          <input
            id="code"
            name="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            autoComplete="one-time-code"
            placeholder="123456"
            className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-center text-lg tracking-[0.5em] focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium hover:opacity-90 transition"
        >
          Verify
        </button>
      </form>

      <form
        action={resendPartnerOtp}
        onSubmit={() => setCooldown(RESEND_COOLDOWN_SEC)}
        className="mt-4 text-center"
      >
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="org" value={org} />
        <button
          type="submit"
          disabled={cooldown > 0}
          className="text-sm text-[var(--color-forest)] font-medium hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}
        </button>
      </form>
    </>
  );
}
