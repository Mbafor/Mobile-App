import type { OpportunityRow } from '@/services/supabase/types';
import type { Opportunity } from '@/types/domain/opportunity';

// location_type validated at DB layer

export function mapOpportunityRow(row: OpportunityRow): Opportunity {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    organization: row.organization,
    imageUrl: row.image_url,
    applyUrl: row.apply_url,
    deadline: row.deadline,
    tags: row.tags ?? [],
    country: row.country,
    category: row.category,
    fundingType: row.funding_type,
    degreeLevels: row.degree_levels ?? [],
    locationType: row.location_type as Opportunity['locationType'],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
