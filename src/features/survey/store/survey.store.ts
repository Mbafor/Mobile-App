import { create } from 'zustand';

type SurveyState = {
  isOpen: boolean;
  /** True when opened manually (e.g. "Give Feedback" footer link) — always allowed, even if already completed. */
  isManual: boolean;
  open: (manual?: boolean) => void;
  close: () => void;
};

export const useSurveyStore = create<SurveyState>((set) => ({
  isOpen: false,
  isManual: false,
  open: (manual = false) => set({ isOpen: true, isManual: manual }),
  close: () => set({ isOpen: false, isManual: false }),
}));
