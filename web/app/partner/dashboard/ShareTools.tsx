'use client';

import { buildPartnerShareMessage, buildPartnerPageLink, type ShareableOpportunity } from '@/lib/partner-share-template';
import { shareToWhatsApp, shareToFacebook, shareToLinkedIn } from '@/lib/share-actions';

export function ShareTools({
  orgName,
  refCode,
  partnerSlug,
  posts,
}: {
  orgName: string;
  refCode: string;
  partnerSlug: string;
  posts: ShareableOpportunity[];
}) {
  const publicPageUrl = buildPartnerPageLink(partnerSlug);

  if (posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        Post at least one opportunity to unlock share tools.
      </p>
    );
  }

  const text = buildPartnerShareMessage(orgName, refCode, posts);

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => shareToWhatsApp(text)}
        className="rounded-md bg-[#25D366] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        Share on WhatsApp
      </button>
      <button
        type="button"
        onClick={() => shareToFacebook(publicPageUrl)}
        className="rounded-md bg-[#1877F2] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        Share on Facebook
      </button>
      <button
        type="button"
        onClick={() => shareToLinkedIn(publicPageUrl)}
        className="rounded-md bg-[#0A66C2] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition"
      >
        Share on LinkedIn
      </button>
    </div>
  );
}
