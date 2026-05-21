export type FundingPreference = 'any' | 'fully_funded' | 'partially_funded' | 'self_funded';

export type UserPreferences = {
  id: string;
  userId: string;
  opportunityTypes: string[];
  preferredCountries: string[];
  fundingPreference: FundingPreference | null;
};
