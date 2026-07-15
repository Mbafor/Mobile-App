import Link from 'next/link';

import { partnerSignup } from './actions';

const ERROR_MESSAGES: Record<string, string> = {
  missing_fields: 'Please fill in every field.',
  invalid_email: 'Enter a valid email address.',
  weak_password: 'Password must be at least 8 characters.',
  password_mismatch: 'Passwords do not match.',
  already_registered: 'An account already exists for this email. Try signing in instead.',
  signup_failed: 'Something went wrong. Please try again.',
};

export default async function PartnerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; org?: string; email?: string }>;
}) {
  const { error, org, email } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4 py-10">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">Create Partner Account</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          Post opportunities and share them with your audience on Voila.
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.'}
          </p>
        )}

        <form action={partnerSignup} className="space-y-4">
          <div>
            <label htmlFor="org" className="block text-sm font-medium mb-1">
              Organization name
            </label>
            <input
              id="org"
              name="org"
              type="text"
              required
              defaultValue={org}
              autoComplete="organization"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={email}
              autoComplete="email"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium hover:opacity-90 transition"
          >
            Create account
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)] text-center">
          Already have an account?{' '}
          <Link href="/partner/login" className="text-[var(--color-forest)] font-medium hover:underline">
            Sign in
          </Link>
        </p>

        <p className="mt-4 text-xs text-[var(--color-muted)] text-center">
          By creating an account you agree to our{' '}
          <Link href="/terms" className="underline hover:text-[var(--color-forest)]">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-[var(--color-forest)]">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
