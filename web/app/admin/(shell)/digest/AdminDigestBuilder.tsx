'use client';

import { useMemo, useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { FUNDING_TYPES } from '@/lib/opportunity-options';
import { shareToWhatsApp, shareToFacebook, shareToLinkedIn, copyToClipboard } from '@/lib/share-actions';
import { buildDigestPageLink, buildDigestSlug, buildWeeklyDigestMessage } from '@/lib/admin-digest';
import { publishAdminDigest } from './actions';

export interface DigestCandidate {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  country: string | null;
  fundingType: string | null;
  applyUrl: string | null;
  deadline: string | null;
  lastSentAt: string | null;
  timesSent: number;
}

const RECENTLY_SENT_DAYS = 7;
const RED_FLAG_DAYS = 2;
const DEFAULT_NUMBER_TO_INCLUDE = 12;

type SortMode = 'soonest' | 'neverSentFirst';
type DeadlineRange = 'any' | '7' | '14' | '30';

function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

function wasRecentlySent(lastSentAt: string | null): boolean {
  if (!lastSentAt) return false;
  const diffDays = (Date.now() - new Date(lastSentAt).getTime()) / (1000 * 60 * 60 * 24);
  return diffDays < RECENTLY_SENT_DAYS;
}

function selectDefaultIds(candidates: DigestCandidate[]): Set<string> {
  const eligible = candidates.filter((c) => !wasRecentlySent(c.lastSentAt));
  const sorted = [...eligible].sort(
    (a, b) => (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity),
  );
  return new Set(sorted.slice(0, DEFAULT_NUMBER_TO_INCLUDE).map((c) => c.id));
}

const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export function AdminDigestBuilder({ candidates }: { candidates: DigestCandidate[] }) {
  const t = useTranslations('Admin.digest');
  const [isPending, startTransition] = useTransition();
  const [pendingChannel, setPendingChannel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [publishedSlug, setPublishedSlug] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<Set<string>>(new Set());
  const [fundingTypes, setFundingTypes] = useState<Set<string>>(new Set());
  const [country, setCountry] = useState('all');
  const [deadlineRange, setDeadlineRange] = useState<DeadlineRange>('any');
  const [hideRecentlySent, setHideRecentlySent] = useState(true);
  const [sortMode, setSortMode] = useState<SortMode>('soonest');
  const [numberToInclude, setNumberToInclude] = useState(String(DEFAULT_NUMBER_TO_INCLUDE));
  const [selected, setSelected] = useState<Set<string>>(() => selectDefaultIds(candidates));

  const slug = useMemo(() => buildDigestSlug(), []);
  const digestUrl = buildDigestPageLink(slug);

  const allCategories = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates) if (c.category) set.add(c.category);
    return Array.from(set).sort();
  }, [candidates]);

  const allCountries = useMemo(() => {
    const set = new Set<string>();
    for (const c of candidates) if (c.country) set.add(c.country);
    return Array.from(set).sort();
  }, [candidates]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const maxDays = deadlineRange === 'any' ? null : Number(deadlineRange);

    return candidates.filter((c) => {
      if (hideRecentlySent && wasRecentlySent(c.lastSentAt)) return false;
      if (categories.size > 0 && (!c.category || !categories.has(c.category))) return false;
      if (fundingTypes.size > 0 && (!c.fundingType || !fundingTypes.has(c.fundingType))) return false;
      if (country !== 'all' && c.country !== country) return false;

      if (maxDays !== null) {
        const remaining = daysUntil(c.deadline);
        if (remaining === null || remaining > maxDays) return false;
      }

      if (query) {
        const haystack = `${c.title} ${c.organization}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }

      return true;
    });
  }, [candidates, search, categories, fundingTypes, country, deadlineRange, hideRecentlySent]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortMode === 'neverSentFirst') {
      arr.sort((a, b) => {
        if (a.timesSent === 0 && b.timesSent !== 0) return -1;
        if (a.timesSent !== 0 && b.timesSent === 0) return 1;
        return (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity);
      });
    } else {
      arr.sort((a, b) => (daysUntil(a.deadline) ?? Infinity) - (daysUntil(b.deadline) ?? Infinity));
    }
    return arr;
  }, [filtered, sortMode]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCategory(cat: string) {
    setCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleFundingType(value: string) {
    setFundingTypes((prev) => {
      const next = new Set(prev);
      if (next.has(value)) next.delete(value);
      else next.add(value);
      return next;
    });
  }

  function regenerateSelection() {
    const n = Math.min(20, Math.max(5, Number(numberToInclude) || DEFAULT_NUMBER_TO_INCLUDE));
    setSelected(new Set(sorted.slice(0, n).map((c) => c.id)));
  }

  const selectedCandidates = useMemo(() => sorted.filter((c) => selected.has(c.id)), [sorted, selected]);
  const previewText = useMemo(() => buildWeeklyDigestMessage(selectedCandidates), [selectedCandidates]);

  function handlePublish(channel: 'whatsapp' | 'facebook' | 'linkedin' | 'copy') {
    if (selectedCandidates.length === 0) return;
    setError(null);
    setPendingChannel(channel);
    startTransition(async () => {
      const result = await publishAdminDigest(
        selectedCandidates.map((c) => c.id),
        channel,
        slug,
      );
      setPendingChannel(null);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setPublishedSlug(slug);
      if (channel === 'whatsapp') shareToWhatsApp(previewText);
      else if (channel === 'facebook') shareToFacebook(digestUrl);
      else if (channel === 'linkedin') shareToLinkedIn(digestUrl);
      else void copyToClipboard(previewText);
    });
  }

  const selectClass =
    'rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm';
  const chipClass = (active: boolean) =>
    `rounded-full border px-3 py-1 text-xs font-medium transition ${
      active
        ? 'bg-primary text-white border-primary'
        : 'border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
    }`;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap gap-3">
        <select value={country} onChange={(e) => setCountry(e.target.value)} className={selectClass}>
          <option value="all">{t('countryAll')}</option>
          {allCountries.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={deadlineRange}
          onChange={(e) => setDeadlineRange(e.target.value as DeadlineRange)}
          className={selectClass}
        >
          <option value="any">{t('deadlineAny')}</option>
          <option value="7">{t('deadline7')}</option>
          <option value="14">{t('deadline14')}</option>
          <option value="30">{t('deadline30')}</option>
        </select>

        <select value={sortMode} onChange={(e) => setSortMode(e.target.value as SortMode)} className={selectClass}>
          <option value="soonest">{t('sortSoonest')}</option>
          <option value="neverSentFirst">{t('sortNeverSentFirst')}</option>
        </select>
      </div>

      {allCategories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {allCategories.map((cat) => (
            <button key={cat} type="button" onClick={() => toggleCategory(cat)} className={chipClass(categories.has(cat))}>
              {cat}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FUNDING_TYPES.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => toggleFundingType(f.value)}
            className={chipClass(fundingTypes.has(f.value))}
          >
            {f.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={hideRecentlySent} onChange={(e) => setHideRecentlySent(e.target.checked)} />
        {t('hideRecentlySent')}
      </label>

      <div className="flex items-center gap-3">
        <span className="text-sm text-[var(--color-muted)]">{t('numberToInclude')}</span>
        <input
          type="number"
          value={numberToInclude}
          onChange={(e) => setNumberToInclude(e.target.value)}
          className="w-20 rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-2 py-1 text-sm"
        />
        <button type="button" onClick={regenerateSelection} className="text-sm font-medium text-primary hover:underline">
          {t('regenerateSelection')}
        </button>
      </div>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] overflow-hidden max-h-[420px] overflow-y-auto">
        {sorted.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)] p-4">{t('emptyList')}</p>
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {sorted.map((c) => {
              const remaining = daysUntil(c.deadline);
              const isRedFlag = remaining !== null && remaining < RED_FLAG_DAYS;
              const neverFeatured = c.timesSent === 0;
              return (
                <li key={c.id} className="p-3">
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selected.has(c.id)}
                      onChange={() => toggle(c.id)}
                      className="mt-1"
                    />
                    <span className="flex-1">
                      <span className="block font-medium text-sm">{c.title}</span>
                      <span className="block text-xs text-[var(--color-muted)]">
                        {c.organization}
                        {c.category ? ` · ${c.category}` : ''}
                        {' · '}
                        {remaining !== null ? t('daysLeft', { days: remaining }) : t('rolling')}
                      </span>
                      {(isRedFlag || neverFeatured) && (
                        <span className="flex flex-wrap gap-2 mt-1">
                          {isRedFlag && <span className="text-[11px] font-semibold text-red-600">{t('closingSoon')}</span>}
                          {neverFeatured && (
                            <span className="text-[11px] font-semibold text-amber-600">
                              {remaining !== null
                                ? t('neverFeaturedWithDays', { days: remaining })
                                : t('neverFeatured')}
                            </span>
                          )}
                        </span>
                      )}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <div>
        <p className="text-sm font-semibold mb-2">{t('livePreview')}</p>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 max-h-64 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-sans">{previewText || t('previewPlaceholder')}</pre>
        </div>
      </div>

      {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>}
      {publishedSlug && <p className="text-sm text-primary">{t('publishedTo', { url: digestUrl })}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => handlePublish('whatsapp')}
          disabled={selectedCandidates.length === 0 || isPending}
          className="rounded-md bg-[#25D366] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {isPending && pendingChannel === 'whatsapp' ? t('publishing') : t('shareWhatsapp')}
        </button>
        <button
          type="button"
          onClick={() => handlePublish('facebook')}
          disabled={selectedCandidates.length === 0 || isPending}
          className="rounded-md bg-[#1877F2] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {isPending && pendingChannel === 'facebook' ? t('publishing') : t('shareFacebook')}
        </button>
        <button
          type="button"
          onClick={() => handlePublish('linkedin')}
          disabled={selectedCandidates.length === 0 || isPending}
          className="rounded-md bg-[#0A66C2] text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {isPending && pendingChannel === 'linkedin' ? t('publishing') : t('shareLinkedin')}
        </button>
        <button
          type="button"
          onClick={() => handlePublish('copy')}
          disabled={selectedCandidates.length === 0 || isPending}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium disabled:opacity-50 hover:bg-[var(--color-surface)] transition"
        >
          {isPending && pendingChannel === 'copy' ? t('publishing') : t('copy')}
        </button>
      </div>
    </div>
  );
}
