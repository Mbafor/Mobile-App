import { createRecentSearchesStore } from '@/utils/store/create-recent-searches-store';

export const useRecentSearchesStore = createRecentSearchesStore('olf.recentSearches');
export const useTrackerRecentSearchesStore = createRecentSearchesStore('olf.recentSearches.tracker');
