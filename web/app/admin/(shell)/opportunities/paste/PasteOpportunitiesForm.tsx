'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { importPastedOpportunities, type ImportPasteResult } from '../actions';

const EXAMPLE = `[
  {
    "title": "Summer Research Internship",
    "organization": "TechBridge Labs",
    "description": "A 12-week program focused on AI research and product development for students passionate about technology and innovation.",
    "benefits": "Monthly stipend, mentorship from senior engineers, and a certificate of completion.",
    "deadline": "2026-12-31",
    "applyUrl": "https://techbridgelabs.com/apply",
    "imageUrl": "https://example.com/banner.jpg",
    "category": "Internship",
    "country": "South Africa",
    "tags": ["Technology & Innovation", "Data & Analytics"],
    "fundingType": "fully_funded",
    "degreeLevels": ["bachelors", "masters"],
    "locationType": "hybrid"
  }
]`;

export function PasteOpportunitiesForm() {
  const t = useTranslations('Admin.opportunities.paste');
  const [raw, setRaw] = useState('');
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportPasteResult | null>(null);

  function handleSubmit(formData: FormData) {
    setResult(null);
    startTransition(async () => {
      const outcome = await importPastedOpportunities(formData);
      setResult(outcome);
      if (outcome.ok === outcome.total && outcome.errors.length === 0) {
        setRaw('');
      }
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <textarea
        name="raw"
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        placeholder={EXAMPLE}
        rows={14}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
      />

      <div className="flex items-center gap-3 justify-end">
        <button
          type="button"
          onClick={() => setRaw(EXAMPLE)}
          className="rounded-md border border-[var(--color-border)] px-4 py-2 text-sm font-medium hover:bg-[var(--color-surface)] transition"
        >
          {t('loadExample')}
        </button>
        <button
          type="submit"
          disabled={isPending || !raw.trim()}
          className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {isPending ? t('importing') : t('importButton')}
        </button>
      </div>

      {result && (
        <div
          className={`text-sm rounded-md px-3 py-2 border ${
            result.errors.length > 0
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-[var(--color-forest)] bg-[var(--color-forest)]/10 border-[var(--color-forest)]/30'
          }`}
        >
          <p className="font-medium">{t('importedSummary', { ok: result.ok, total: result.total })}</p>
          {result.errors.length > 0 && (
            <ul className="list-disc list-inside mt-1">
              {result.errors.slice(0, 10).map((message, i) => (
                <li key={i}>{message}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
