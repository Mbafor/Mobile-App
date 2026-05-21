import { useEffect, useMemo, useState } from 'react';

import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import {
  countActiveFilters,
  filterOpportunities,
} from '@/features/opportunities/utils/search-opportunities';
import {
  EMPTY_OPPORTUNITY_FILTERS,
  type OpportunityFilters,
} from '@/types/domain/opportunity';

export function useOpportunitySearch() {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filters, setFilters] = useState<OpportunityFilters>(EMPTY_OPPORTUNITY_FILTERS);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const opportunitiesQuery = useActiveOpportunities();

  const results = useMemo(() => {
    const all = opportunitiesQuery.data ?? [];
    return filterOpportunities(all, debouncedQuery, filters);
  }, [debouncedQuery, filters, opportunitiesQuery.data]);

  const activeFilterCount = countActiveFilters(filters);

  const clearFilters = () => setFilters(EMPTY_OPPORTUNITY_FILTERS);

  return {
    query,
    setQuery,
    filters,
    setFilters,
    results,
    resultCount: results.length,
    activeFilterCount,
    clearFilters,
    isLoading: opportunitiesQuery.isLoading,
    isRefetching: opportunitiesQuery.isRefetching,
    error: opportunitiesQuery.error,
    refetch: opportunitiesQuery.refetch,
  };
}
