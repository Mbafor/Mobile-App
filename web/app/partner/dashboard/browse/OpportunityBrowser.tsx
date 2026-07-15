'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';

import { buildPartnerOpportunityMessage, buildBridgeLink } from '@/lib/partner-share-template';
import { shareToWhatsApp, shareToFacebook, shareToLinkedIn, copyToClipboard } from '@/lib/share-actions';

export interface BrowserOpportunity {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  country: string | null;
  location_type: string | null;
  funding_type: string | null;
  apply_url: string | null;
  tags: string[] | null;
  image_url: string | null;
}

export function OpportunityBrowser({
  opportunities,
  refCode,
}: {
  opportunities: BrowserOpportunity[];
  refCode: string;
}) {
  const t = useTranslations('Partner.browse');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function formatDeadline(deadline: string | null): string {
    if (!deadline) return t('rolling');
    const date = new Date(deadline);
    if (Number.isNaN(date.getTime())) return t('rolling');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const opp of opportunities) if (opp.category) set.add(opp.category);
    return Array.from(set).sort();
  }, [opportunities]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const beforeDate = deadlineBefore ? new Date(deadlineBefore) : null;

    return opportunities.filter((opp) => {
      if (category !== 'all' && opp.category !== category) return false;

      if (beforeDate) {
        if (!opp.deadline) return false;
        const oppDeadline = new Date(opp.deadline);
        if (oppDeadline > beforeDate) return false;
      }

      if (query) {
        const haystack = `${opp.title} ${opp.organization} ${opp.country ?? ''}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [opportunities, search, category, deadlineBefore]);

  function shareOpportunity(opp: BrowserOpportunity, channel: 'whatsapp' | 'facebook' | 'linkedin' | 'copy') {
    const text = buildPartnerOpportunityMessage(
      {
        id: opp.id,
        title: opp.title,
        organization: opp.organization,
        description: opp.description,
        category: opp.category,
        country: opp.country,
        locationType: opp.location_type,
        fundingType: opp.funding_type,
        applyUrl: opp.apply_url,
        tags: opp.tags ?? [],
        deadline: opp.deadline,
      },
      refCode,
    );
    const link = opp.apply_url?.trim() || buildBridgeLink(opp.id, refCode);

    if (channel === 'whatsapp') shareToWhatsApp(text);
    else if (channel === 'facebook') shareToFacebook(link);
    else if (channel === 'linkedin') shareToLinkedIn(link);
    else {
      void copyToClipboard(text);
      setCopiedId(opp.id);
      setTimeout(() => setCopiedId((current) => (current === opp.id ? null : current)), 2000);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          type="text"
          placeholder={t('searchPlaceholder')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
        />
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          {t('deadlineBefore')}
          <input
            type="date"
            value={deadlineBefore}
            onChange={(e) => setDeadlineBefore(e.target.value)}
            className="rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-2 text-sm"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => setCategory('all')}
          className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
            category === 'all'
              ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          {t('allCategories')}
        </button>
        {categories.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition ${
              category === c
                ? 'bg-[var(--color-forest)] border-[var(--color-forest)] text-white'
                : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-[var(--color-muted)]">{t('empty')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((opp) => (
            <div
              key={opp.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden flex flex-col"
            >
              <div className="h-[120px] bg-[var(--color-surface)] shrink-0">
                {opp.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={opp.image_url} alt="" loading="lazy" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[var(--color-forest)]">
                    <span className="text-2xl font-bold text-white">{opp.organization.charAt(0)}</span>
                  </div>
                )}
              </div>

              <div className="p-3 flex-1 flex flex-col gap-1">
                <p className="text-sm font-semibold leading-snug line-clamp-2">{opp.title}</p>
                <p className="text-xs text-[var(--color-muted)] truncate">{opp.organization}</p>
                <p className="text-xs text-[var(--color-muted)]">{formatDeadline(opp.deadline)}</p>

                {opp.tags && opp.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {opp.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[var(--color-surface)] text-[var(--color-muted)] text-[11px] px-2 py-0.5 truncate max-w-[120px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-auto pt-2">
                  <button
                    type="button"
                    onClick={() => shareOpportunity(opp, 'whatsapp')}
                    title={t('shareWhatsappTitle')}
                    className="rounded-md bg-[#25D366] text-white px-2 py-1 text-[11px] font-medium hover:opacity-90 transition"
                  >
                    {t('whatsapp')}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareOpportunity(opp, 'facebook')}
                    title={t('shareFacebookTitle')}
                    className="rounded-md bg-[#1877F2] text-white px-2 py-1 text-[11px] font-medium hover:opacity-90 transition"
                  >
                    {t('facebook')}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareOpportunity(opp, 'linkedin')}
                    title={t('shareLinkedinTitle')}
                    className="rounded-md bg-[#0A66C2] text-white px-2 py-1 text-[11px] font-medium hover:opacity-90 transition"
                  >
                    {t('linkedin')}
                  </button>
                  <button
                    type="button"
                    onClick={() => shareOpportunity(opp, 'copy')}
                    title={t('copyTitle')}
                    className="rounded-md border border-[var(--color-border)] px-2 py-1 text-[11px] font-medium hover:bg-[var(--color-surface)] transition"
                  >
                    {copiedId === opp.id ? t('copied') : t('copy')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
