import { useEffect, useState } from 'react';

// Uses getHours() which always returns 0–23 in local time,
// regardless of the user's locale or 12h/24h display preference.
// So "9pm" and "21:00" are both hour 21 and both resolve to "evening".
function getPhrase(): string {
  const hour = new Date().getHours();
  if (hour < 5) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  return 'evening';
}

/**
 * Returns "night" | "morning" | "afternoon" | "evening" based on the user's
 * local clock. Re-evaluates every 60 seconds so long-lived sessions stay accurate.
 *
 * Thresholds:
 *  00:00–04:59  → night
 *  05:00–11:59  → morning
 *  12:00–17:59  → afternoon
 *  18:00–23:59  → evening
 */
export function useGreeting(): string {
  const [phrase, setPhrase] = useState<string>(getPhrase);

  useEffect(() => {
    const id = setInterval(() => setPhrase(getPhrase()), 60_000);
    return () => clearInterval(id);
  }, []);

  return phrase;
}
