'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

/** Debounced free-text search that drives the URL's `search` query param --
 * the caller's server component page re-fetches with the new value. Resets
 * `page` back to 0 on every change since a new search invalidates the old
 * page's meaning. */
export function SearchBox({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get('search') ?? '');

  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) params.set('search', value.trim());
      else params.delete('search');
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, 400);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <input
      type="text"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm mb-4"
    />
  );
}
