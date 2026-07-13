'use client';

import { useMemo, useState, useTransition } from 'react';

import { buildPartnerShareMessage, buildPartnerPageLink, type ShareableOpportunity } from '@/lib/partner-share-template';
import { ShareButtonRow } from '../ShareButtonRow';
import { publishPartnerDigest } from '../actions';
import type { BrowserOpportunity } from '../browse/OpportunityBrowser';

export interface PastDigestGroup {
  slug: string;
  postedAt: string;
  opportunities: ShareableOpportunity[];
}

function formatDeadline(deadline: string | null): string {
  if (!deadline) return 'Rolling';
  const date = new Date(deadline);
  if (Number.isNaN(date.getTime())) return 'Rolling';
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function PartnerDigestBuilder({
  opportunities,
  pastDigests,
  orgName,
  refCode,
  partnerSlug,
}: {
  opportunities: BrowserOpportunity[];
  pastDigests: PastDigestGroup[];
  orgName: string;
  refCode: string;
  partnerSlug: string;
}) {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isPending, startTransition] = useTransition();
  const [justPublished, setJustPublished] = useState<ShareableOpportunity[] | null>(null);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return opportunities;
    return opportunities.filter((opp) => {
      const haystack = `${opp.title} ${opp.organization} ${opp.country ?? ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [opportunities, search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePublish() {
    const ids = Array.from(selected);
    if (ids.length === 0) return;

    startTransition(async () => {
      const result = await publishPartnerDigest(ids);
      if (!result) return;

      const published = opportunities
        .filter((opp) => ids.includes(opp.id))
        .map((opp) => ({ id: opp.id, title: opp.title, organization: opp.organization, deadline: opp.deadline }));

      setJustPublished(published);
      setSelected(new Set());
    });
  }

  return (
    <div>
      <p className="text-sm text-[var(--color-muted)] mb-4">
        Pick the opportunities you want to feature this week, then publish -- they&apos;ll be bundled into a single
        shareable digest and added to your own posted opportunities.
      </p>

      {justPublished ? (
        <div className="mb-6 rounded-lg border border-[var(--color-forest)]/30 bg-[var(--color-forest)]/10 p-4">
          <p className="text-sm text-[var(--color-forest)] font-medium mb-3">
            Published your digest of {justPublished.length} opportunit{justPublished.length === 1 ? 'y' : 'ies'}.
          </p>
          <ShareButtonRow
            text={buildPartnerShareMessage(orgName, refCode, partnerSlug, justPublished)}
            link={buildPartnerPageLink(partnerSlug)}
          />
        </div>
      ) : null}

      <input
        type="text"
        placeholder="Search title, organization, country..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-md border border-[var(--color-border)] px-3 py-2 text-sm mb-3"
      />

      <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)] max-h-[420px] overflow-y-auto mb-4">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-muted)]">No opportunities match this search.</p>
        )}
        {filtered.map((opp) => (
          <label key={opp.id} className="flex items-start gap-3 p-3 text-sm cursor-pointer">
            <input type="checkbox" checked={selected.has(opp.id)} onChange={() => toggle(opp.id)} className="mt-1" />
            <span className="flex-1">
              <span className="font-medium">{opp.title}</span>
              <span className="block text-[var(--color-muted)]">
                {opp.organization} · {formatDeadline(opp.deadline)}
                {opp.category ? ` · ${opp.category}` : ''}
              </span>
            </span>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePublish}
        disabled={selected.size === 0 || isPending}
        className="rounded-md bg-[var(--color-forest)] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
      >
        {isPending ? 'Publishing...' : `Publish ${selected.size || ''} as this week's digest`.trim()}
      </button>

      {pastDigests.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold mb-3">Your previous digests</h3>
          <div className="space-y-4">
            {pastDigests.map((group) => (
              <div key={group.slug} className="rounded-lg border border-[var(--color-border)] p-4">
                <p className="text-xs text-[var(--color-muted)] mb-2">
                  {new Date(group.postedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}{' '}
                  · {group.opportunities.length} opportunit{group.opportunities.length === 1 ? 'y' : 'ies'}
                </p>
                <ul className="text-sm mb-3 list-disc list-inside">
                  {group.opportunities.map((opp) => (
                    <li key={opp.id}>{opp.title}</li>
                  ))}
                </ul>
                <ShareButtonRow
                  text={buildPartnerShareMessage(orgName, refCode, partnerSlug, group.opportunities)}
                  link={buildPartnerPageLink(partnerSlug)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
