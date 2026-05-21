export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: {
      delete_own_account: {
        Args: Record<string, never>;
        Returns: undefined;
      };
      get_admin_dashboard_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_admin_analytics: {
        Args: Record<string, never>;
        Returns: Json;
      };
      current_user_is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          country: string | null;
          university: string | null;
          degree_level: string | null;
          course_major: string | null;
          interests: string[];
          career_interests: string[];
          onboarding_complete: boolean;
          is_admin: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          country?: string | null;
          university?: string | null;
          degree_level?: string | null;
          course_major?: string | null;
          interests?: string[];
          career_interests?: string[];
          onboarding_complete?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          country?: string | null;
          university?: string | null;
          degree_level?: string | null;
          course_major?: string | null;
          interests?: string[];
          career_interests?: string[];
          onboarding_complete?: boolean;
          is_admin?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          opportunity_types: string[];
          preferred_countries: string[];
          funding_preference: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          opportunity_types?: string[];
          preferred_countries?: string[];
          funding_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          opportunity_types?: string[];
          preferred_countries?: string[];
          funding_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      opportunities: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          organization: string;
          image_url: string | null;
          apply_url: string | null;
          deadline: string;
          tags: string[];
          country: string | null;
          category: string | null;
          funding_type: string | null;
          degree_levels: string[];
          location_type: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          organization: string;
          image_url?: string | null;
          apply_url?: string | null;
          deadline: string;
          tags?: string[];
          country?: string | null;
          category?: string | null;
          funding_type?: string | null;
          degree_levels?: string[];
          location_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          organization?: string;
          image_url?: string | null;
          apply_url?: string | null;
          deadline?: string;
          tags?: string[];
          country?: string | null;
          category?: string | null;
          funding_type?: string | null;
          degree_levels?: string[];
          location_type?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_opportunities: {
        Row: {
          user_id: string;
          opportunity_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          opportunity_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          opportunity_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      applied_opportunities: {
        Row: {
          user_id: string;
          opportunity_id: string;
          applied_at: string;
        };
        Insert: {
          user_id: string;
          opportunity_id: string;
          applied_at?: string;
        };
        Update: {
          user_id?: string;
          opportunity_id?: string;
          applied_at?: string;
        };
        Relationships: [];
      };
      notification_preferences: {
        Row: {
          user_id: string;
          push_enabled: boolean;
          new_matches: boolean;
          deadline_reminders: boolean;
          saved_reminders: boolean;
          last_match_sync_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          push_enabled?: boolean;
          new_matches?: boolean;
          deadline_reminders?: boolean;
          saved_reminders?: boolean;
          last_match_sync_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          push_enabled?: boolean;
          new_matches?: boolean;
          deadline_reminders?: boolean;
          saved_reminders?: boolean;
          last_match_sync_at?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_push_tokens: {
        Row: {
          id: string;
          user_id: string;
          expo_push_token: string;
          platform: string | null;
          device_id: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          expo_push_token: string;
          platform?: string | null;
          device_id?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          expo_push_token?: string;
          platform?: string | null;
          device_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: 'new_match' | 'deadline_reminder' | 'saved_reminder';
          title: string;
          body: string;
          opportunity_id: string | null;
          dedupe_key: string;
          read_at: string | null;
          push_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'new_match' | 'deadline_reminder' | 'saved_reminder';
          title: string;
          body: string;
          opportunity_id?: string | null;
          dedupe_key: string;
          read_at?: string | null;
          push_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'new_match' | 'deadline_reminder' | 'saved_reminder';
          title?: string;
          body?: string;
          opportunity_id?: string | null;
          dedupe_key?: string;
          read_at?: string | null;
          push_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];
export type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
export type NotificationPreferencesRow =
  Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
