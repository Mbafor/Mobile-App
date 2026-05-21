import type { LocationType, Opportunity } from '@/types/domain/opportunity';

export type OpportunityFormValues = {
  title: string;
  organization: string;
  description: string;
  imageUrl: string;
  deadline: string;
  tags: string[];
  country: string;
  category: string;
  fundingType: string;
  degreeLevels: string[];
  locationType: LocationType | '';
  applyUrl: string;
};

export const EMPTY_OPPORTUNITY_FORM: OpportunityFormValues = {
  title: '',
  organization: '',
  description: '',
  imageUrl: '',
  deadline: '',
  tags: [],
  country: '',
  category: '',
  fundingType: '',
  degreeLevels: [],
  locationType: '',
  applyUrl: '',
};

export function opportunityToFormValues(opportunity: Opportunity): OpportunityFormValues {
  const deadlineDate = opportunity.deadline.slice(0, 10);

  return {
    title: opportunity.title,
    organization: opportunity.organization,
    description: opportunity.description ?? '',
    imageUrl: opportunity.imageUrl ?? '',
    deadline: deadlineDate,
    tags: opportunity.tags,
    country: opportunity.country ?? '',
    category: opportunity.category ?? '',
    fundingType: opportunity.fundingType ?? '',
    degreeLevels: opportunity.degreeLevels,
    locationType: opportunity.locationType ?? '',
    applyUrl: opportunity.applyUrl ?? '',
  };
}
