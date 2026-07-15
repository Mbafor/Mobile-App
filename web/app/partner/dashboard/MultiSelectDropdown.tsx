'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';

export function MultiSelectDropdown({
  name,
  options,
  placeholder,
  defaultSelected = [],
}: {
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  defaultSelected?: string[];
}) {
  const t = useTranslations('Partner.form');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<string[]>(defaultSelected);
  const containerRef = useRef<HTMLDivElement>(null);
  const resolvedPlaceholder = placeholder ?? t('selectDefault');

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function toggleValue(value: string, checked: boolean) {
    setSelected((prev) => (checked ? [...prev, value] : prev.filter((v) => v !== value)));
  }

  const summary = options
    .filter((o) => selected.includes(o.value))
    .map((o) => o.label)
    .join(', ');

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-left flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
      >
        <span className={`truncate ${summary ? '' : 'text-[var(--color-muted)]'}`}>{summary || resolvedPlaceholder}</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`h-4 w-4 shrink-0 text-[var(--color-muted)] transition-transform ${open ? 'rotate-180' : ''}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {/* Real checkboxes stay mounted at all times (only visibility toggles) so the
          native form still collects checked values even while the panel is closed. */}
      <div
        className={`absolute z-10 mt-1 w-full max-h-56 overflow-y-auto rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 shadow-lg space-y-0.5 ${
          open ? 'block' : 'hidden'
        }`}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 rounded px-2 py-1.5 text-sm cursor-pointer hover:bg-[var(--color-surface)]"
          >
            <input
              type="checkbox"
              name={name}
              value={option.value}
              checked={selected.includes(option.value)}
              onChange={(e) => toggleValue(option.value, e.target.checked)}
            />
            {option.label}
          </label>
        ))}
      </div>
    </div>
  );
}
