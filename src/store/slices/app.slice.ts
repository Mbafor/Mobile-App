import { create } from 'zustand';

type AppState = {
  isHydrated: boolean;
  setHydrated: (value: boolean) => void;
};

/**
 * Global app bootstrap state (hydration, init flags).
 * Auth session lives in features/auth/store.
 */
export const useAppStore = create<AppState>((set) => ({
  isHydrated: false,
  setHydrated: (isHydrated) => set({ isHydrated }),
}));
