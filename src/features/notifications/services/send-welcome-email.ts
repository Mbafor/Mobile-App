import { notificationsEmailApi, profilesApi } from '@/services/api';

/** Fire-and-forget welcome email after onboarding (deduped via profiles.welcome_email_sent_at). */
export async function sendWelcomeEmailIfNeeded(
  userId: string,
  email: string | null | undefined,
  fullName: string | null | undefined,
): Promise<void> {
  if (!email?.trim()) return;

  const { data: profile } = await profilesApi.getByUserId(userId);
  if (!profile || profile.welcomeEmailSentAt) return;

  // Atomically claim the send slot. Only the first concurrent caller that
  // actually writes the timestamp (claimed = true) proceeds to send.
  const { claimed } = await profilesApi.markWelcomeEmailSent(userId);
  if (!claimed) return;

  await notificationsEmailApi.sendWelcome(email, fullName ?? null);
}
