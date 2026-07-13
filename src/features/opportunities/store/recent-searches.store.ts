import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const MAX_RECENT_SEARCHES = 8;

type RecentSearchesState = {
  queries: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearAll: () => void;
};

export const useRecentSearchesStore = create<RecentSearchesState>()(
  persist(
    (set) => ({
      queries: [],
      addSearch: (query) => {
        const trimmed = query.trim();
        if (!trimmed) return;
        set((state) => ({
          queries: [
            trimmed,
            ...state.queries.filter((q) => q.toLowerCase() !== trimmed.toLowerCase()),
          ].slice(0, MAX_RECENT_SEARCHES),
        }));
      },
      removeSearch: (query) =>
        set((state) => ({ queries: state.queries.filter((q) => q !== query) })),
      clearAll: () => set({ queries: [] }),
    }),
    {
      name: 'olf.recentSearches',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
