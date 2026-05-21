import type { PropsWithChildren } from 'react';
import { createContext, useContext } from 'react';

import { useCVBuilder } from '@/features/cv-builder/hooks/useCVBuilder';

type CVBuilderContextValue = ReturnType<typeof useCVBuilder>;

const CVBuilderContext = createContext<CVBuilderContextValue | null>(null);

type CVBuilderProviderProps = PropsWithChildren<{
  cvId: string;
}>;

export function CVBuilderProvider({ cvId, children }: CVBuilderProviderProps) {
  const value = useCVBuilder(cvId);
  return <CVBuilderContext.Provider value={value}>{children}</CVBuilderContext.Provider>;
}

export function useCVBuilderContext(): CVBuilderContextValue {
  const ctx = useContext(CVBuilderContext);
  if (!ctx) {
    throw new Error('useCVBuilderContext must be used within CVBuilderProvider');
  }
  return ctx;
}
