import { useEffect, useState } from 'react';

function getPhrase(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

/**
 * Returns "morning" | "afternoon" | "evening" based on the user's local clock.
 * Re-evaluates every 60 seconds so long-lived sessions stay accurate.
 */
export function useGreeting(): string {
  const [phrase, setPhrase] = useState<string>(getPhrase);

  useEffect(() => {
    const id = setInterval(() => setPhrase(getPhrase()), 60_000);
    return () => clearInterval(id);
  }, []);

  return phrase;
}
