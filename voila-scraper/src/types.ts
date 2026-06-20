export interface RawOpportunity {
  title: string;
  organization: string;
  description: string;
  deadline: string;
  applyUrl: string;
  imageUrl: string;
  source: string;
}

export interface OpportunityRecord {
  title: string;
  organization: string;
  description: string;
  deadline: string | null;
  apply_url: string;
  image_url: string;
  category: string;
  country: string;
  tags: string[];
  funding_type: string;
  degree_levels: string[];
  location_type: string;
  source: string;
  status: 'pending';
  is_active: false;
}

export interface ScraperStats {
  scraped: number;
  newCount: number;
  skipped: number;
  pagesVisited: number;
}

export interface ScraperResult extends ScraperStats {
  opportunities: RawOpportunity[];
}

export type CheckDuplicateFn = (url: string) => Promise<boolean>;
