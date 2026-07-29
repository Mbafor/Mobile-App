import type { AdminAnalytics, ChartDatum, TopEngagementRow } from '@/features/admin/types/analytics';
import { mapOpportunityRow } from '@/services/api/mappers/opportunity.mapper';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { parseDeadlineToIso } from '@/features/admin/utils/deadline';
import { supabase } from '@/services/supabase/client';
import type { Database } from '@/services/supabase/types';

type OpportunityInsert = Database['public']['Tables']['opportunities']['Insert'];

export type AdminDashboardStats = {
  opportunitiesCount: number;
  usersCount: number;
  savedCount: number;
  appliedCount: number;
};

function formToRow(values: OpportunityFormValues): OpportunityInsert {
  const category = values.category.trim();
  const tagSet = new Set(values.tags.map((t) => t.trim()).filter(Boolean));
  if (category) tagSet.add(category);

  const funding = values.fundingType.trim();
  const fundingType = funding && funding !== 'any' ? funding : null;

  // Deadline is optional on updates (scraped opportunities may have none).
  // createOpportunity enforces presence + future-date separately.
  const deadlineRaw = values.deadline.trim();
  const deadline = deadlineRaw ? parseDeadlineToIso(deadlineRaw) : null;

  return {
    title: values.title.trim(),
    organization: values.organization.trim(),
    description: values.description.trim() || null,
    image_url: values.imageUrl.trim() || null,
    apply_url: values.applyUrl.trim() || null,
    deadline,
    tags: [...tagSet],
    country: values.country.trim() || null,
    category: category || null,
    funding_type: fundingType,
    degree_levels: values.degreeLevels,
    location_type: values.locationType || null,
  };
}

function formatAdminError(error: { message: string; code?: string }): Error {
  const msg = error.message ?? 'Request failed';
  if (
    error.code === '42501' ||
    msg.toLowerCase().includes('row-level security') ||
    msg.toLowerCase().includes('not authorized')
  ) {
    return new Error(
      'Permission denied. In Supabase, set profiles.is_admin = true for your user, then sign out and back in.',
    );
  }
  return new Error(msg);
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

function mapAnalyticsPayload(payload: unknown): AdminAnalytics | null {
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

function mapStatsPayload(payload: unknown): AdminDashboardStats | null {
  if (!payload || typeof payload !== 'object') return null;
  const row = payload as Record<string, number>;
  return {
    opportunitiesCount: row.opportunities_count ?? 0,
    usersCount: row.users_count ?? 0,
    savedCount: row.saved_count ?? 0,
    appliedCount: row.applied_count ?? 0,
  };
}

/** Admin-only operations — enforced by RLS and RPC checks. */
export const adminApi = {
  getDashboardStats: async () => {
    const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
    if (error) return { data: null, error };
    return { data: mapStatsPayload(data), error: null };
  },

  getAnalytics: async () => {
    const { data, error } = await supabase.rpc('get_admin_analytics');
    if (error) return { data: null, error };
    return { data: mapAnalyticsPayload(data), error: null };
  },

  listOpportunities: async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };
    return { data: (data ?? []).map(mapOpportunityRow), error: null };
  },

  listPending: async (page = 0, pageSize = 25) => {
    const from = page * pageSize;
    const to = from + pageSize - 1;
    const { data, error, count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')
      .order('scraped_at', { ascending: true })
      .range(from, to);

    if (error) return { data: null, error, hasMore: false };
    return {
      data: (data ?? []).map(mapOpportunityRow),
      error: null,
      hasMore: count != null ? from + pageSize < count : (data ?? []).length === pageSize,
    };
  },

  approveOpportunity: async (id: string, notes?: string) => {
    const { error } = await supabase.rpc('approve_opportunity', {
      p_opportunity_id: id,
      p_notes: notes ?? null,
    });
    if (error) return { error: formatAdminError(error) };
    return { error: null };
  },

  rejectOpportunity: async (id: string, notes?: string) => {
    const { error } = await supabase.rpc('reject_opportunity', {
      p_opportunity_id: id,
      p_notes: notes ?? null,
    });
    if (error) return { error: formatAdminError(error) };
    return { error: null };
  },

  getOpportunity: async (id: string) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data ? mapOpportunityRow(data) : null, error };
  },

  createOpportunity: async (values: OpportunityFormValues) => {
    try {
      const { data: canManage, error: permError } = await supabase.rpc(
        'current_user_can_manage_opportunities',
      );
      if (permError) {
        return { data: null, error: formatAdminError(permError) };
      }
      if (!canManage) {
        return {
          data: null,
          error: new Error(
            'Permission denied. You need admin or super admin access to manage opportunities.',
          ),
        };
      }

      const baseRow = formToRow(values);

      // Manual creates must have a deadline set in the future.
      if (!baseRow.deadline) {
        return { data: null, error: new Error('Deadline is required when creating an opportunity.') };
      }
      if (new Date(baseRow.deadline).getTime() <= Date.now()) {
        return { data: null, error: new Error('Deadline must be in the future so students can see this listing.') };
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Admin-created opportunities skip the scraper queue — publish immediately.
      const row = {
        ...baseRow,
        status: 'approved' as const,
        is_active: true,
        ...(user?.id ? { created_by: user.id } : {}),
      };
      const { data, error } = await supabase
        .from('opportunities')
        .insert(row as OpportunityInsert)
        .select('*');

      if (error) return { data: null, error: formatAdminError(error) };

      const inserted = data?.[0];
      if (!inserted) {
        return {
          data: null,
          error: new Error(
            'Insert did not return a row. Confirm migration 007_admin.sql is applied and your user is an admin.',
          ),
        };
      }

      return { data: mapOpportunityRow(inserted), error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error('Invalid opportunity data'),
      };
    }
  },

  updateOpportunity: async (id: string, values: OpportunityFormValues) => {
    try {
      const { data: canManage, error: permError } = await supabase.rpc(
        'current_user_can_manage_opportunities',
      );
      if (permError) {
        return { data: null, error: formatAdminError(permError) };
      }
      if (!canManage) {
        return {
          data: null,
          error: new Error(
            'Permission denied. You need admin or super admin access to manage opportunities.',
          ),
        };
      }

      const row = formToRow(values);
      const { data, error } = await supabase
        .from('opportunities')
        .update(row)
        .eq('id', id)
        .select('*');

      if (error) return { data: null, error: formatAdminError(error) };

      const updated = data?.[0];
      if (!updated) {
        return { data: null, error: new Error('Opportunity not found or could not be updated.') };
      }

      return { data: mapOpportunityRow(updated), error: null };
    } catch (e) {
      return {
        data: null,
        error: e instanceof Error ? e : new Error('Invalid opportunity data'),
      };
    }
  },

  deleteOpportunity: async (id: string) => {
    return supabase.from('opportunities').delete().eq('id', id);
  },
};
