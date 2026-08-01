import type { AppTheme } from '@/theme/theme';
import { ThemeToggle } from '@/app/partner/ThemeToggle';
import { LanguageToggle } from '@/app/partner/LanguageToggle';
import { AdminMobileNav } from './AdminMobileNav';

export function AdminHeader({
  name,
  isSuperAdmin,
  theme,
}: {
  name: string;
  isSuperAdmin: boolean;
  theme: AppTheme;
}) {
  return (
    <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-background)] px-4 py-3">
      <div className="flex items-center gap-2 min-w-0">
        <AdminMobileNav name={name} isSuperAdmin={isSuperAdmin} />
        <p className="font-semibold text-primary truncate sm:hidden">{name}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <LanguageToggle />
        <ThemeToggle theme={theme} />
      </div>
    </header>
  );
}
