import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import type { UserProfile } from '@/types/domain';

type AuthState = {
  session: Session | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isHydrating: boolean;
  isProfileLoading: boolean;
  setHydrating: (value: boolean) => void;
  setProfileLoading: (value: boolean) => void;
  setSession: (session: Session | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  reset: () => void;
};

const initialState = {
  session: null,
  profile: null,
  isAuthenticated: false,
  isHydrating: true,
  isProfileLoading: false,
};

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setHydrating: (isHydrating) => set({ isHydrating }),
  setProfileLoading: (isProfileLoading) => set({ isProfileLoading }),
  setSession: (session) =>
    set({
      session,
      isAuthenticated: session !== null,
    }),
  setProfile: (profile) => set({ profile }),
  reset: () => set({ ...initialState, isHydrating: false, isProfileLoading: false }),
}));
