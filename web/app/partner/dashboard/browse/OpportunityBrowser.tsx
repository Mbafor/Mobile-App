'use client';

import { useMemo, useState } from 'react';

import { buildPartnerShareMessage, buildBridgeLink } from '@/lib/partner-share-template';
import { shareToWhatsApp, shareToFacebook, shareToLinkedIn, copyToClipboard } from '@/lib/share-actions';

export interface BrowserOpportunity {
  id: string;
  title: string;
  organization: string;
  category: string | null;
  deadline: string | null;
  country: string | null;
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Rolling';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'Rolling';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function OpportunityBrowser({
  opportunities,
  orgName,
  refCode,
  partnerSlug,
}: {
  opportunities: BrowserOpportunity[];
  orgName: string;
  refCode: string;
  partnerSlug: string;
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    const text = buildPartnerShareMessage(orgName, refCode, partnerSlug, [opp]);
    const link = buildBridgeLink(opp.id, refCode);

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
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          placeholder="Search title, organization, country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-md border border-[var(--color-border)] px-3 py-2 text-sm"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm text-[var(--color-muted)]">
          Deadline before
          <input
            type="date"
            value={deadlineBefore}
            onChange={(e) => setDeadlineBefore(e.target.value)}
            className="rounded-md border border-[var(--color-border)] px-2 py-2 text-sm"
          />
        </label>
      </div>

      <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)] max-h-[560px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-muted)]">No opportunities match these filters.</p>
        )}
        {filtered.map((opp) => (
          <div key={opp.id} className="flex flex-wrap items-center justify-between gap-3 p-3 text-sm">
            <div className="flex-1 min-w-[200px]">
              <span className="font-medium">{opp.title}</span>
              <span className="block text-[var(--color-muted)]">
                {opp.organization} · {formatDeadline(opp.deadline)}
                {opp.category ? ` · ${opp.category}` : ''}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => shareOpportunity(opp, 'whatsapp')}
                title="Share on WhatsApp"
                className="rounded-md bg-[#25D366] text-white px-2.5 py-1.5 text-xs font-medium hover:opacity-90 transition"
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => shareOpportunity(opp, 'facebook')}
                title="Share on Facebook"
                className="rounded-md bg-[#1877F2] text-white px-2.5 py-1.5 text-xs font-medium hover:opacity-90 transition"
              >
                Facebook
              </button>
              <button
                type="button"
                onClick={() => shareOpportunity(opp, 'linkedin')}
                title="Share on LinkedIn"
                className="rounded-md bg-[#0A66C2] text-white px-2.5 py-1.5 text-xs font-medium hover:opacity-90 transition"
              >
                LinkedIn
              </button>
              <button
                type="button"
                onClick={() => shareOpportunity(opp, 'copy')}
                title="Copy share text"
                className="rounded-md border border-[var(--color-border)] px-2.5 py-1.5 text-xs font-medium hover:bg-[var(--color-surface)] transition"
              >
                {copiedId === opp.id ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
