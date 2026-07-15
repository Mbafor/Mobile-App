'use client';

import { useTranslations } from 'next-intl';

import { buildPartnerShareMessage, buildPartnerPageLink, type ShareableOpportunity } from '@/lib/partner-share-template';
import { ShareButtonRow } from './ShareButtonRow';

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
  const t = useTranslations('Partner.share');

  if (posts.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        {t('unlockHint')}
      </p>
    );
  }

  const text = buildPartnerShareMessage(orgName, refCode, partnerSlug, posts);
  const publicPageUrl = buildPartnerPageLink(partnerSlug);

  return <ShareButtonRow text={text} link={publicPageUrl} />;
}
