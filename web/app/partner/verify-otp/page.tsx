import { redirect } from 'next/navigation';

import { PartnerOtpForm } from './PartnerOtpForm';

const ERROR_MESSAGES: Record<string, string> = {
  invalid_code: 'That code is incorrect or has expired. Please try again.',
  account_disabled: 'This partner account is disabled. Contact support for help.',
};

export default async function PartnerVerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; org?: string; error?: string; resent?: string }>;
}) {
  const { email, org, error, resent } = await searchParams;

  if (!email || !org) redirect('/partner/signup');

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">Verify your email</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          We sent a 6-digit code to <span className="font-medium">{email}</span>. Enter it below to finish
          creating your partner account.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
          </p>
        )}
        {resent && !error && (
          <p className="mb-4 text-sm text-[var(--color-forest)] bg-[var(--color-forest)]/10 border border-[var(--color-forest)]/30 rounded-md px-3 py-2">
            Code resent — check your inbox.
          </p>
        )}

        <PartnerOtpForm email={email} org={org} />
      </div>
    </main>
  );
}
