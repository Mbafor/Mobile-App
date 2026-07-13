'use client';

import { useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { postOpportunities } from './actions';

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
  postedIds,
}: {
  opportunities: BrowserOpportunity[];
  postedIds: string[];
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [deadlineBefore, setDeadlineBefore] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [posted, setPosted] = useState<Set<string>>(new Set(postedIds));
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

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

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePost() {
    const ids = Array.from(selected).filter((id) => !posted.has(id));
    if (ids.length === 0) return;

    startTransition(async () => {
      await postOpportunities(ids);
      setPosted((prev) => new Set([...prev, ...ids]));
      setSelected(new Set());
      setMessage(`Posted ${ids.length} opportunit${ids.length === 1 ? 'y' : 'ies'} to your dashboard.`);
      router.refresh();
    });
  }

  const selectableCount = Array.from(selected).filter((id) => !posted.has(id)).length;

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

      {message && <p className="mb-3 text-sm text-[var(--color-forest)]">{message}</p>}

      <div className="border border-[var(--color-border)] rounded-lg divide-y divide-[var(--color-border)] max-h-[480px] overflow-y-auto">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-[var(--color-muted)]">No opportunities match these filters.</p>
        )}
        {filtered.map((opp) => {
          const isPosted = posted.has(opp.id);
          return (
            <label
              key={opp.id}
              className={`flex items-start gap-3 p-3 text-sm cursor-pointer ${isPosted ? 'opacity-60' : ''}`}
            >
              <input
                type="checkbox"
                checked={selected.has(opp.id) || isPosted}
                disabled={isPosted}
                onChange={() => toggle(opp.id)}
                className="mt-1"
              />
              <span className="flex-1">
                <span className="font-medium">{opp.title}</span>
                <span className="block text-[var(--color-muted)]">
                  {opp.organization} · {formatDeadline(opp.deadline)}
                  {opp.category ? ` · ${opp.category}` : ''}
                </span>
              </span>
              {isPosted && <span className="text-xs text-[var(--color-forest)] font-medium">Posted</span>}
            </label>
          );
        })}
      </div>

      <button
        type="button"
        onClick={handlePost}
        disabled={selectableCount === 0 || isPending}
        className="mt-4 rounded-md bg-[var(--color-forest)] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
      >
        {isPending ? 'Posting...' : `Post ${selectableCount || ''} to my dashboard`.trim()}
      </button>
    </div>
  );
}
