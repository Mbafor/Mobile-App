import type { PropsWithChildren } from 'react';

import { useHideMainTabBar } from '@/features/cv-builder/hooks/useHideMainTabBar';

/** Ensures main app tabs stay hidden on stack screens above the CV hub tabs. */
export function HideMainTabBar({ children }: PropsWithChildren) {
  useHideMainTabBar();
  return children;
}
