const BRAND = '#0B6623';

export const EMAIL_FROM = Deno.env.get('RESEND_EMAIL_FROM') ?? 'Voila <noreply@voila-africa.com>';

export function appWebBase(): string {
  return (Deno.env.get('APP_WEB_URL') ?? 'https://voila-africa.com').replace(/\/$/, '');
}

export function emailShell(params: {
  headline: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaHref?: string;
  footerNote?: string;
}): string {
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
      <div style="max-width:520px; margin:0 auto; background:#ffffff;">

        <!-- Header -->
        <div style="padding:18px 32px; border-bottom:3px solid ${BRAND};">
          <span style="font-size:14px; font-weight:700; color:${BRAND}; letter-spacing:3px;">VOILA</span>
        </div>

        <!-- Body -->
        <div style="padding:36px 32px;">
          <h1 style="margin:0 0 20px; font-size:21px; font-weight:600; color:#111111; line-height:1.35;">
            ${params.headline}
          </h1>
          <div style="font-size:14px; color:#444444; line-height:1.75;">
            ${params.bodyHtml}
          </div>
          ${cta}
        </div>

        <!-- Footer -->
        <div style="padding:16px 32px 24px; border-top:1px solid #e8e8e8;">
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
