export type ChartDatum = {
  label: string;
  value: number;
};

export type TopEngagementRow = {
  opportunityId: string;
  title: string;
  count: number;
};

export type AdminAnalytics = {
  users: {
    total: number;
    newThisWeek: number;
    newThisMonth: number;
    onboardingComplete: number;
    onboardingIncomplete: number;
  };
  opportunities: {
    total: number;
    closingIn7Days: number;
    byCategory: ChartDatum[];
    byCountry: ChartDatum[];
    byFundingType: ChartDatum[];
  };
  engagement: {
    totalSaves: number;
    totalApplied: number;
    topSaved: TopEngagementRow[];
    topApplied: TopEngagementRow[];
  };
  notifications: {
    totalSent: number;
    totalUnread: number;
  };
};
