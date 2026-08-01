const BRAND = '#0B6623';

export const EMAIL_FROM = Deno.env.get('RESEND_EMAIL_FROM') ?? 'Voila <noreply@voila-africa.com>';

export function appWebBase(): string {
  return (Deno.env.get('APP_WEB_URL') ?? 'https://voila-africa.com').replace(/\/$/, '');
}

function brandLogoUrl(): string {
  return `${appWebBase()}/images/main_logo.png`;
}

const SOCIAL_LINKS = [
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/voila-africa/', icon: 'icon-linkedin.png' },
  { label: 'Facebook', href: 'https://www.facebook.com/voilaafrica', icon: 'icon-facebook.png' },
];

export function emailShell(params: {
  headline?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}): string {
  const headline = params.headline
    ? `<h1 style="margin:0 0 20px; font-size:21px; font-weight:600; color:#111111; line-height:1.35;">
         ${params.headline}
       </h1>`
    : '';

  const cta =
    params.ctaLabel && params.ctaHref
      ? `<div style="margin-top:28px;">
           <a href="${params.ctaHref}"
              style="display:inline-block; background:${BRAND}; color:#ffffff;
                     padding:13px 28px; text-decoration:none; font-size:14px;
                     font-weight:600; letter-spacing:0.2px;">
             ${params.ctaLabel}
           </a>
         </div>`
      : '';

  return `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;
         background:#f0f0f0; padding:40px 16px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border:1px solid #e8e8e8; overflow:hidden;">

        <!-- Header -->
        <div style="padding:18px 32px; border-bottom:3px solid ${BRAND}; background:#ffffff;">
          <img src="${brandLogoUrl()}" alt="Voila Africa" style="max-height:36px; width:auto; display:block;" />
        </div>

        <!-- Body -->
        <div style="padding:36px 32px;">
          ${headline}
          <div style="font-size:14px; color:#444444; line-height:1.75;">
            ${params.bodyHtml}
          </div>
          ${cta}

          <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e8e8e8;">
            <p style="margin:0 0 10px; font-size:11px; color:#999999; letter-spacing:1px; text-transform:uppercase;">
              Follow us
            </p>
            <div>
              ${SOCIAL_LINKS.map(
                (s) => `<a href="${s.href}" style="display:inline-block; margin-right:10px;">
                  <img src="${appWebBase()}/images/${s.icon}" alt="${s.label}" width="28" height="28"
                       style="width:28px; height:28px; border-radius:50%; display:block;" />
                </a>`,
              ).join('')}
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="padding:24px 32px; border-top:1px solid #e8e8e8; text-align:center;">
          <img src="${brandLogoUrl()}" alt="Voila Africa" style="height:56px; width:auto; display:inline-block; margin-bottom:12px;" />
          <p style="margin:0; font-size:11px; color:#aaaaaa; line-height:1.6;">
            ${params.footerNote ?? 'Voila &mdash; Helping students find global opportunities'}
          </p>
        </div>

      </div>
    </div>
  `;
}

export function infoBox(rows: { label: string; value: string }[]): string {
  const items = rows
    .filter((r) => r.value.trim())
    .map(
      (r) => `
      <div style="margin-bottom:14px;">
        <p style="margin:0 0 2px; font-size:11px; color:#888888; text-transform:uppercase; letter-spacing:0.6px;">
          ${r.label}
        </p>
        <p style="margin:0; font-size:14px; color:#111111; font-weight:500; line-height:1.4;">
          ${r.value}
        </p>
      </div>`,
    )
    .join('');

  return `
    <div style="border-left:3px solid ${BRAND}; padding:16px 20px; margin:20px 0; background:#f8f8f8;">
      ${items}
    </div>
  `;
}

export function profileCardHtml(params: {
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  interests: string[];
  extraLines: { label: string; value: string }[];
}): string {
  const initial = params.name.charAt(0).toUpperCase();

  const bio = params.bio?.trim()
    ? `<p style="margin:10px 0 0; font-size:13px; color:#444444; line-height:1.6;">
        ${params.bio.trim().slice(0, 240)}${params.bio.length > 240 ? '&hellip;' : ''}
       </p>`
    : '';

  const interests =
    params.interests.length > 0
      ? `<p style="margin:10px 0 0; font-size:12px; color:#666666;">
           <span style="font-weight:600;">Interests:</span>
           ${params.interests.slice(0, 6).join(', ')}
         </p>`
      : '';

  const extras = params.extraLines
    .filter((l) => l.value.trim())
    .map(
      (l) => `<p style="margin:6px 0 0; font-size:12px; color:#666666;">
        <span style="font-weight:600;">${l.label}:</span> ${l.value}
      </p>`,
    )
    .join('');

  return `
    <div style="border:1px solid #e0e0e0; padding:20px; margin:20px 0;">
      <div style="width:44px; height:44px; background:${BRAND}; color:#ffffff;
           font-size:18px; font-weight:700; line-height:44px; text-align:center;
           margin-bottom:12px;">
        ${initial}
      </div>
      <p style="margin:0; font-size:16px; font-weight:600; color:#111111;">${params.name}</p>
      ${bio}
      ${interests}
      ${extras}
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(text: string, max: number): string {
  const trimmed = text.trim();
  return trimmed.length > max ? `${trimmed.slice(0, max).trimEnd()}…` : trimmed;
}

export function newMessageEmailHtml(params: {
  recipientFirstName: string;
  senderName: string;
  ctaHref: string;
  /** Unread message bodies from this sender, oldest first. */
  previewMessages: string[];
}): { subject: string; html: string } {
  const senderName = escapeHtml(params.senderName);
  const recipientFirstName = escapeHtml(params.recipientFirstName);
  const count = params.previewMessages.length;
  const shown = params.previewMessages.slice(-3);
  const hiddenCount = count - shown.length;

  const messageLines = shown
    .map(
      (msg) => `
      <p style="margin:0 0 10px; padding:12px 14px; background:#f8f8f8; border-left:3px solid ${BRAND};
           font-size:13px; color:#333333; line-height:1.6;">
        ${escapeHtml(truncate(msg, 150))}
      </p>`,
    )
    .join('');

  const moreNote =
    hiddenCount > 0
      ? `<p style="margin:0 0 10px; font-size:12px; color:#888888;">
           + ${hiddenCount} more message${hiddenCount === 1 ? '' : 's'}
         </p>`
      : '';

  const subject = count > 1 ? `${senderName} sent you ${count} messages on Voila` : `${senderName} sent you a message on Voila`;

  const html = emailShell({
    headline: `You have a new message from ${senderName}`,
    bodyHtml: `
      <p>Hi ${recipientFirstName},</p>
      <p>${senderName} messaged you and it looks like you haven't seen it yet:</p>
      ${messageLines}
      ${moreNote}
      <p style="margin-top:16px; font-size:13px; color:#666666;">Reply on Voila to keep the conversation going.</p>
    `,
    ctaLabel: 'Open conversation',
    ctaHref: params.ctaHref,
    footerNote: 'You are receiving this because you have an active mentorship conversation on Voila.',
  });

  return { subject, html };
}

export function staleThreadNudgeEmailHtml(params: {
  recipientFirstName: string;
  senderName: string;
  hoursWaiting: number;
  /** '48h' for the first nudge, '7d' for the final one. */
  urgency: '48h' | '7d';
  ctaHref: string;
}): { subject: string; html: string } {
  const senderName = escapeHtml(params.senderName);
  const recipientFirstName = escapeHtml(params.recipientFirstName);
  const days = Math.floor(params.hoursWaiting / 24);
  const waitingLabel = days >= 1 ? `${days} day${days === 1 ? '' : 's'}` : `${Math.round(params.hoursWaiting)} hours`;
  const isFinal = params.urgency === '7d';

  const subject = isFinal
    ? `Final reminder: ${senderName} is still waiting to hear from you`
    : `${senderName} is waiting on your reply`;

  const headline = isFinal ? `${senderName} still hasn't heard back from you` : `You have an unanswered message`;

  const urgencyNote = isFinal
    ? `<p style="margin-top:12px; font-size:13px; color:#b3261e;">
         This is the final reminder for this conversation &mdash; we won't nudge you again about this message.
       </p>`
    : '';

  const html = emailShell({
    headline,
    bodyHtml: `
      <p>Hi ${recipientFirstName},</p>
      <p>${senderName} sent you a message ${waitingLabel} ago on Voila and hasn't heard back yet.</p>
      ${urgencyNote}
      <p style="margin-top:16px; font-size:13px; color:#666666;">A quick reply keeps your mentorship moving.</p>
    `,
    ctaLabel: 'Reply now',
    ctaHref: params.ctaHref,
    footerNote: 'You are receiving this because you have an active mentorship conversation on Voila.',
  });

  return { subject, html };
}

export async function sendResendEmail(params: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [params.to],
      subject: params.subject,
      html: params.html,
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    return { ok: false, error: data.message ?? 'Failed to send email' };
  }
  return { ok: true, id: data.id };
}
