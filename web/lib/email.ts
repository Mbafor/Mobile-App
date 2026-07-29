/** Event confirmation email, sent synchronously from the registration server
 * action (web/app/events/[slug]/actions.ts). Raw fetch to the Resend API,
 * matching the pattern already used in web/app/api/webhooks/resend-sync and
 * the Supabase edge functions' _shared/email-templates.ts -- duplicated
 * rather than imported since edge functions run on Deno and this runs on
 * Node, same precedent as lib/opportunity-options.ts. */

const BRAND = '#0B6623';

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const EMAIL_FROM = process.env.RESEND_EMAIL_FROM ?? 'Voila <noreply@voila-africa.com>';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://voila-africa.com').replace(/\/$/, '');

function emailShell(params: { headline: string; bodyHtml: string; ctaLabel?: string; ctaHref?: string }): string {
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
        <div style="display:flex; align-items:center; justify-content:space-between; gap:16px; padding:18px 32px; border-bottom:3px solid ${BRAND}; background:#ffffff;">
          <div style="font-size:14px; font-weight:700; color:${BRAND}; letter-spacing:2px; text-transform:uppercase;">
            Voila Africa
          </div>
          <img src="${SITE_URL}/images/main_logo.png" alt="Voila Africa" style="max-height:28px; width:auto; display:block;" />
        </div>
        <div style="padding:36px 32px;">
          <h1 style="margin:0 0 20px; font-size:21px; font-weight:600; color:#111111; line-height:1.35;">
            ${params.headline}
          </h1>
          <div style="font-size:14px; color:#444444; line-height:1.75;">
            ${params.bodyHtml}
          </div>
          ${cta}
          <div style="margin-top:32px; padding-top:24px; border-top:1px solid #e8e8e8;">
            <p style="margin:0 0 8px; font-size:11px; color:#999999; letter-spacing:1px; text-transform:uppercase;">
              Follow us
            </p>
            <p style="margin:0; font-size:14px; color:#0B6623;">
              <a href="https://www.linkedin.com/company/voila-africa/" style="color:#0B6623; text-decoration:none; font-weight:600;">LinkedIn</a>
              <span style="margin:0 10px; color:#cccccc;">|</span>
              <a href="https://www.facebook.com/voilaafrica" style="color:#0B6623; text-decoration:none; font-weight:600;">Facebook</a>
            </p>
          </div>
        </div>
        <div style="padding:16px 32px 24px; border-top:1px solid #e8e8e8;">
          <p style="margin:0; font-size:11px; color:#aaaaaa; line-height:1.6;">
            Voila &mdash; Helping students find global opportunities
          </p>
        </div>
      </div>
    </div>
  `;
}

function eventImageHtml(imageUrl: string | null, title: string): string {
  if (!imageUrl) return '';
  return `<img src="${imageUrl}" alt="${title}" style="width:100%; max-height:220px; object-fit:cover; border-radius:4px; margin-bottom:20px; display:block;" />`;
}

export async function sendEventConfirmationEmail(params: {
  to: string;
  fullName: string;
  eventTitle: string;
  eventUrl: string;
  eventImageUrl: string | null;
  dateLabel: string;
  timeLabel: string;
  registrationRef: string;
  icsContent: string;
}): Promise<{ ok: boolean; error?: string; id?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY is not configured.' };

  const firstName = params.fullName.split(' ')[0] || params.fullName;

  const html = emailShell({
    headline: `You're registered, ${firstName}!`,
    bodyHtml: `
      ${eventImageHtml(params.eventImageUrl, params.eventTitle)}
      <p>Hi ${firstName},</p>
      <p>Thank you for registering for <strong>${params.eventTitle}</strong> hosted by Voila Africa.</p>
      <p style="margin:16px 0 0;">&#128197; Date: ${params.dateLabel}</p>
      <p style="margin:4px 0 16px;">&#128340; Time: ${params.timeLabel}</p>
      <p>We're excited to have you join us.</p>
      <p>You will receive reminder emails closer to the event with the joining details.</p>
      <p style="margin-top:20px;">See you there!</p>
      <p style="margin:20px 0 0;">The Voila Africa Team</p>
      <p style="margin-top:24px; font-size:11px; color:#999999;">Registration reference: ${params.registrationRef}</p>
      <p>A calendar invite is attached to this email -- add it to your calendar so you don't miss it.</p>
    `,
    ctaLabel: 'View event',
    ctaHref: params.eventUrl,
  });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [params.to],
      subject: `You're registered: ${params.eventTitle}`,
      html,
      attachments: [
        {
          filename: 'event.ics',
          content: Buffer.from(params.icsContent, 'utf-8').toString('base64'),
        },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    return { ok: false, error: data.message ?? `Resend request failed (${res.status})` };
  }

  return { ok: true, id: data.id };
}
