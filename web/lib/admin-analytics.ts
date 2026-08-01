/** Ported from mapAnalyticsPayload in src/services/api/admin.api.ts (mobile app) --
 * same get_admin_analytics RPC payload shape, duplicated rather than imported since
 * web/ and the Expo app are separate TS programs with no shared package. */

export interface ChartDatum {
  label: string;
  value: number;
}

export interface TopEngagementRow {
  opportunityId: string;
  title: string;
  count: number;
}

export interface AdminAnalytics {
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
}

function mapChartData(value: unknown): ChartDatum[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      label: String(item.label ?? 'Unknown'),
      value: Number(item.value ?? 0),
    };
  });
}

function mapTopEngagement(value: unknown): TopEngagementRow[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const item = row as Record<string, unknown>;
    return {
      opportunityId: String(item.opportunity_id ?? ''),
      title: String(item.title ?? 'Untitled'),
      count: Number(item.count ?? 0),
    };
  });
}

export function mapAdminAnalytics(payload: unknown): AdminAnalytics | null {
  if (!payload || typeof payload !== 'object') return null;
  const data = payload as Record<string, Record<string, unknown>>;
  const users = data.users ?? {};
  const opportunities = data.opportunities ?? {};
  const engagement = data.engagement ?? {};
  const notifications = data.notifications ?? {};

  return {
    users: {
      total: Number(users.total ?? 0),
      newThisWeek: Number(users.new_this_week ?? 0),
      newThisMonth: Number(users.new_this_month ?? 0),
      onboardingComplete: Number(users.onboarding_complete ?? 0),
      onboardingIncomplete: Number(users.onboarding_incomplete ?? 0),
    },
    opportunities: {
      total: Number(opportunities.total ?? 0),
      closingIn7Days: Number(opportunities.closing_in_7_days ?? 0),
      byCategory: mapChartData(opportunities.by_category),
      byCountry: mapChartData(opportunities.by_country),
      byFundingType: mapChartData(opportunities.by_funding_type),
    },
    engagement: {
      totalSaves: Number(engagement.total_saves ?? 0),
      totalApplied: Number(engagement.total_applied ?? 0),
      topSaved: mapTopEngagement(engagement.top_saved),
      topApplied: mapTopEngagement(engagement.top_applied),
    },
    notifications: {
      totalSent: Number(notifications.total_sent ?? 0),
      totalUnread: Number(notifications.total_unread ?? 0),
    },
  };
}
