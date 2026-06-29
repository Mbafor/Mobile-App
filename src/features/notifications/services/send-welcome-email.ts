import { notificationsEmailApi, profilesApi } from '@/services/api';

/** Fire-and-forget welcome email after onboarding (deduped via profiles.welcome_email_sent_at). */
export async function sendWelcomeEmailIfNeeded(
  userId: string,
  email: string | null | undefined,
  fullName: string | null | undefined,
): Promise<void> {
  if (!email?.trim()) return;

  // Cheap local short-circuit — avoids the network call when already sent.
  const { data: profile } = await profilesApi.getByUserId(userId);
  if (!profile || profile.welcomeEmailSentAt) return;

  // The edge function owns the authoritative atomic claim (UPDATE WHERE IS NULL).
  // Passing user_id lets the server dedup concurrent calls and prevents double-sends
  // even if this client-side check races (e.g. double-tap, strict-mode re-mount).
  await notificationsEmailApi.sendWelcome(userId, email, fullName ?? null);
}
