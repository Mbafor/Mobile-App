'use client';

import { useState, useTransition } from 'react';

import { buildPartnerShareMessage, buildPartnerPageLink, type ShareableOpportunity } from '@/lib/partner-share-template';
import { shareToWhatsApp, shareToFacebook, shareToLinkedIn, copyToClipboard } from '@/lib/share-actions';
import { shareAdminDigest } from './actions';

export function AdminDigestSection({
  orgName,
  refCode,
  partnerSlug,
  digestSlug,
  opportunities,
}: {
  orgName: string;
  refCode: string;
  partnerSlug: string;
  digestSlug: string | null;
  opportunities: ShareableOpportunity[];
}) {
  const [isPending, startTransition] = useTransition();
  const [shared, setShared] = useState(false);

  if (!digestSlug || opportunities.length === 0) {
    return <p className="text-sm text-[var(--color-muted)]">No digest published yet -- check back soon.</p>;
  }

  const publicPageUrl = buildPartnerPageLink(partnerSlug);
  const text = buildPartnerShareMessage(orgName, refCode, opportunities);

  function handleShare(channel: 'whatsapp' | 'facebook' | 'linkedin' | 'copy') {
    startTransition(async () => {
      await shareAdminDigest(
        opportunities.map((o) => o.id),
        digestSlug as string,
      );
      setShared(true);

      if (channel === 'whatsapp') shareToWhatsApp(text);
      else if (channel === 'facebook') shareToFacebook(publicPageUrl);
      else if (channel === 'linkedin') shareToLinkedIn(publicPageUrl);
      else await copyToClipboard(text);
    });
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-muted)] mb-3">
        {opportunities.length} opportunit{opportunities.length === 1 ? 'y' : 'ies'} curated by Voila this week.
        Sharing posts them to your own dashboard too.
      </p>
      {shared && <p className="text-sm text-[var(--color-forest)] mb-3">Shared to your dashboard.</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleShare('whatsapp')}
          className="rounded-md bg-[#25D366] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          Share on WhatsApp
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleShare('facebook')}
          className="rounded-md bg-[#1877F2] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          Share on Facebook
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleShare('linkedin')}
          className="rounded-md bg-[#0A66C2] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          Share on LinkedIn
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => handleShare('copy')}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-[var(--color-surface)] transition"
        >
          Copy to clipboard
        </button>
      </div>
    </div>
  );
}
