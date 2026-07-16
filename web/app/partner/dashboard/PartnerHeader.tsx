import type { AppTheme } from '@/theme/theme';
import { ThemeToggle } from '../ThemeToggle';
import { LanguageToggle } from '../LanguageToggle';
import { PartnerMobileNav } from './PartnerMobileNav';

export function PartnerHeader({
  orgName,
  contactEmail,
  theme,
}: {
  orgName: string;
  contactEmail: string;
  theme: AppTheme;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <PartnerMobileNav orgName={orgName} contactEmail={contactEmail} />
        <p className="font-semibold text-[var(--color-forest)] truncate">{orgName}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle theme={theme} />
      </div>
    </header>
  );
}
