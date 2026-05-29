const BRAND = '#1A3D25';
const MUTED = '#555555';
const LIGHT_BG = '#F3F7F4';

export const EMAIL_FROM = Deno.env.get('RESEND_EMAIL_FROM') ?? 'Olives Forum <onboarding@resend.dev>';

export function appWebBase(): string {
  return (Deno.env.get('APP_WEB_URL') ?? 'https://olivesforum.com').replace(/\/$/, '');
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
      ? `<a href="${params.ctaHref}"
          style="display: inline-block; background: ${BRAND}; color: white; padding: 14px 28px;
          border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;
          margin: 8px 0 24px;">
          ${params.ctaLabel}
        </a>`
      : '';

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1a1a1a;">
      <div style="width: 48px; height: 48px; background: ${BRAND}; border-radius: 12px;
        display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
        <span style="color: white; font-size: 22px; font-weight: 700;">O</span>
      </div>
      <h1 style="font-size: 22px; font-weight: 600; margin: 0 0 12px; line-height: 1.3;">
        ${params.headline}
      </h1>
      <div style="color: ${MUTED}; line-height: 1.65; margin-bottom: 20px;">
        ${params.bodyHtml}
      </div>
      ${cta}
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="color: #aaa; font-size: 12px; margin: 0; line-height: 1.5;">
        ${params.footerNote ?? 'Olives Forum · Helping students find global opportunities'}
      </p>
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
  const avatar = params.avatarUrl
    ? `<img src="${params.avatarUrl}" alt="" width="72" height="72"
        style="border-radius: 50%; object-fit: cover; display: block; margin-bottom: 16px;" />`
    : `<div style="width: 72px; height: 72px; border-radius: 50%; background: ${BRAND};
        color: white; font-size: 28px; font-weight: 700; line-height: 72px; text-align: center;
        margin-bottom: 16px;">
        ${params.name.charAt(0).toUpperCase()}
      </div>`;

  const interests =
    params.interests.length > 0
      ? `<p style="margin: 12px 0 0; font-size: 14px; color: ${MUTED};">
          <strong>Interests:</strong> ${params.interests.slice(0, 8).join(', ')}
        </p>`
      : '';

  const extras = params.extraLines
    .filter((l) => l.value.trim())
    .map(
      (l) => `<p style="margin: 8px 0 0; font-size: 14px; color: ${MUTED};">
        <strong>${l.label}:</strong> ${l.value}
      </p>`,
    )
    .join('');

  const bio = params.bio?.trim()
    ? `<p style="margin: 12px 0 0; font-size: 14px; color: #333; line-height: 1.55;">
        ${params.bio.trim().slice(0, 280)}${params.bio.length > 280 ? '…' : ''}
      </p>`
    : '';

  return `
    <div style="background: ${LIGHT_BG}; border-radius: 12px; padding: 20px; margin-bottom: 20px;">
      ${avatar}
      <p style="margin: 0; font-size: 18px; font-weight: 600;">${params.name}</p>
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
