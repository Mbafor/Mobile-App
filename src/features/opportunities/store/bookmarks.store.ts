import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type BookmarksState = {
  ids: string[];
  toggle: (id: string) => void;
  isBookmarked: (id: string) => boolean;
};

export const useBookmarksStore = create<BookmarksState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id) =>
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((item) => item !== id)
            : [...state.ids, id],
        })),
      isBookmarked: (id) => get().ids.includes(id),
    }),
    {
      name: 'olf.bookmarks',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
