import { create } from 'zustand';

type InlineSearchToggleState = {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
};

/** Lets the header search icon open/close an inline search bar on whichever screen (Events/Tracker) currently owns it — each screen resets this to closed on focus. */
export const useInlineSearchToggle = create<InlineSearchToggleState>((set) => ({
  open: false,
  toggle: () => set((s) => ({ open: !s.open })),
  setOpen: (open) => set({ open }),
}));
