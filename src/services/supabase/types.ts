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
      current_user_is_approved_mentor: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      mentor_active_mentee_count: {
        Args: { p_mentor_id: string };
        Returns: number;
      };
      mentorship_match_score: {
        Args: { p_student_id: string; p_mentor_id: string };
        Returns: number;
      };
      request_mentorship_coach: {
        Args: { p_requested_mentor_id?: string | null };
        Returns: Json;
      };
      cancel_mentorship_request: {
        Args: { p_request_id?: string | null };
        Returns: Json;
      };
      end_mentorship: {
        Args: {
          p_mentorship_id: string;
          p_status: string;
          p_reason?: string | null;
        };
        Returns: Json;
      };
      run_mentorship_maintenance: {
        Args: Record<string, never>;
        Returns: Json;
      };
      expire_due_mentorships: {
        Args: Record<string, never>;
        Returns: number;
      };
      toggle_availability_slot: {
        Args: {
          p_day_of_week: number;
          p_start_time: string;
          p_end_time: string;
          p_timezone?: string;
        };
        Returns: Json;
      };
      book_mentorship_session: {
        Args: {
          p_mentorship_id: string;
          p_scheduled_start: string;
          p_scheduled_end: string;
          p_timezone?: string;
          p_title?: string;
          p_notes?: string | null;
        };
        Returns: Json;
      };
      cancel_mentorship_session: {
        Args: { p_session_id: string; p_reason?: string };
        Returns: Json;
      };
      complete_past_mentorship_sessions: {
        Args: Record<string, never>;
        Returns: number;
      };
      current_user_can_manage_opportunities: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      super_admin_create_mentor_by_email: {
        Args: { p_email: string };
        Returns: Json;
      };
      super_admin_delete_mentor: {
        Args: { p_user_id: string };
        Returns: Json;
      };
      get_super_admin_overview: { Args: Record<string, never>; Returns: Json };
      get_super_admin_mentors: {
        Args: {
          p_search?: string | null;
          p_status?: string | null;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Json;
      };
      get_super_admin_mentees: {
        Args: { p_search?: string | null; p_limit?: number; p_offset?: number };
        Returns: Json;
      };
      get_super_admin_admins: {
        Args: { p_search?: string | null; p_limit?: number; p_offset?: number };
        Returns: Json;
      };
      super_admin_approve_mentor: { Args: { p_user_id: string }; Returns: Json };
      super_admin_set_mentor_status: {
        Args: { p_user_id: string; p_status: string };
        Returns: Json;
      };
      super_admin_set_admin: { Args: { p_user_id: string; p_is_admin: boolean }; Returns: Json };
      super_admin_promote_admin_by_email: {
        Args: { p_email: string; p_is_admin?: boolean };
        Returns: Json;
      };
      super_admin_broadcast_to_mentors: {
        Args: { p_subject: string; p_body: string; p_target_mentor_id?: string | null };
        Returns: Json;
      };
      get_super_admin_opportunities_analytics: { Args: Record<string, never>; Returns: Json };
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
          is_super_admin: boolean;
          avatar_url: string | null;
          welcome_email_sent_at: string | null;
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
          avatar_url?: string | null;
          welcome_email_sent_at?: string | null;
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
          avatar_url?: string | null;
          welcome_email_sent_at?: string | null;
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
          created_by: string | null;
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
          stage: string;
          notes: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          opportunity_id: string;
          created_at?: string;
          stage?: string;
          notes?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          opportunity_id?: string;
          created_at?: string;
          stage?: string;
          notes?: string | null;
          updated_at?: string;
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
          mentorship_assignments: boolean;
          waiting_list_updates: boolean;
          session_reminders: boolean;
          mentorship_messages: boolean;
          last_match_sync_at: string | null;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          push_enabled?: boolean;
          new_matches?: boolean;
          deadline_reminders?: boolean;
          saved_reminders?: boolean;
          mentorship_assignments?: boolean;
          waiting_list_updates?: boolean;
          session_reminders?: boolean;
          mentorship_messages?: boolean;
          last_match_sync_at?: string | null;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          push_enabled?: boolean;
          new_matches?: boolean;
          deadline_reminders?: boolean;
          saved_reminders?: boolean;
          mentorship_assignments?: boolean;
          waiting_list_updates?: boolean;
          session_reminders?: boolean;
          mentorship_messages?: boolean;
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
      cvs: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          template_id: string;
          content: Json;
          reminder_count: number;
          last_reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          template_id?: string;
          content?: Json;
          reminder_count?: number;
          last_reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          template_id?: string;
          content?: Json;
          reminder_count?: number;
          last_reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      cv_payments: {
        Row: {
          id: string;
          user_id: string;
          cv_id: string;
          amount: number;
          type: 'download' | 'template_unlock';
          status: 'pending' | 'success' | 'failed';
          paystack_reference: string | null;
          template_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          cv_id: string;
          amount: number;
          type: 'download' | 'template_unlock';
          status?: 'pending' | 'success' | 'failed';
          paystack_reference?: string | null;
          template_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          cv_id?: string;
          amount?: number;
          type?: 'download' | 'template_unlock';
          status?: 'pending' | 'success' | 'failed';
          paystack_reference?: string | null;
          template_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type:
            | 'new_match'
            | 'deadline_reminder'
            | 'saved_reminder'
            | 'mentor_assigned'
            | 'mentee_assigned'
            | 'waiting_list_update'
            | 'session_reminder'
            | 'session_booked'
            | 'mentorship_message'
            | 'mentor_broadcast';
          title: string;
          body: string;
          opportunity_id: string | null;
          metadata: Json;
          dedupe_key: string;
          read_at: string | null;
          push_sent_at: string | null;
          email_sent_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type:
            | 'new_match'
            | 'deadline_reminder'
            | 'saved_reminder'
            | 'mentor_assigned'
            | 'mentee_assigned'
            | 'waiting_list_update'
            | 'session_reminder'
            | 'session_booked'
            | 'mentorship_message'
            | 'mentor_broadcast';
          title: string;
          body: string;
          opportunity_id?: string | null;
          metadata?: Json;
          dedupe_key: string;
          read_at?: string | null;
          push_sent_at?: string | null;
          email_sent_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?:
            | 'new_match'
            | 'deadline_reminder'
            | 'saved_reminder'
            | 'mentor_assigned'
            | 'mentee_assigned'
            | 'waiting_list_update'
            | 'session_reminder'
            | 'session_booked'
            | 'mentorship_message'
            | 'mentor_broadcast';
          title?: string;
          body?: string;
          opportunity_id?: string | null;
          metadata?: Json;
          dedupe_key?: string;
          read_at?: string | null;
          push_sent_at?: string | null;
          email_sent_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      mentor_profiles: {
        Row: {
          user_id: string;
          status: string;
          bio: string | null;
          mentoring_majors: string[];
          mentoring_interests: string[];
          mentoring_career_areas: string[];
          mentoring_degree_levels: string[];
          max_students: number;
          is_accepting_students: boolean;
          applied_at: string;
          reviewed_at: string | null;
          reviewed_by: string | null;
          rejection_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          status?: string;
          bio?: string | null;
          mentoring_majors?: string[];
          mentoring_interests?: string[];
          mentoring_career_areas?: string[];
          mentoring_degree_levels?: string[];
          max_students?: number;
          is_accepting_students?: boolean;
          applied_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          status?: string;
          bio?: string | null;
          mentoring_majors?: string[];
          mentoring_interests?: string[];
          mentoring_career_areas?: string[];
          mentoring_degree_levels?: string[];
          max_students?: number;
          is_accepting_students?: boolean;
          applied_at?: string;
          reviewed_at?: string | null;
          reviewed_by?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mentorship_requests: {
        Row: {
          id: string;
          student_id: string;
          status: string;
          requested_mentor_id: string | null;
          match_snapshot: Json;
          match_score: number | null;
          matched_mentor_id: string | null;
          matched_at: string | null;
          mentorship_id: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          status?: string;
          requested_mentor_id?: string | null;
          match_snapshot?: Json;
          match_score?: number | null;
          matched_mentor_id?: string | null;
          matched_at?: string | null;
          mentorship_id?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          status?: string;
          requested_mentor_id?: string | null;
          match_snapshot?: Json;
          match_score?: number | null;
          matched_mentor_id?: string | null;
          matched_at?: string | null;
          mentorship_id?: string | null;
          cancelled_at?: string | null;
          cancel_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      mentorship_waiting_list: {
        Row: {
          id: string;
          request_id: string;
          student_id: string;
          entered_at: string;
          priority: number;
        };
        Insert: {
          id?: string;
          request_id: string;
          student_id: string;
          entered_at?: string;
          priority?: number;
        };
        Update: {
          id?: string;
          request_id?: string;
          student_id?: string;
          entered_at?: string;
          priority?: number;
        };
        Relationships: [];
      };
      availability_slots: {
        Row: {
          id: string;
          coach_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          timezone: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          coach_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          timezone?: string;
        };
        Update: Partial<Database['public']['Tables']['availability_slots']['Insert']>;
        Relationships: [];
      };
      mentor_availability_rules: {
        Row: {
          id: string;
          mentor_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          timezone: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      mentorship_sessions: {
        Row: {
          id: string;
          mentorship_id: string;
          created_by: string;
          student_id: string | null;
          coach_id: string | null;
          scheduled_start: string;
          scheduled_end: string;
          timezone: string;
          status: string;
          title: string | null;
          notes: string | null;
          meeting_url: string | null;
          joined_at: string | null;
          ended_at: string | null;
          cancelled_at: string | null;
          cancel_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      mentorship_messages: {
        Row: {
          id: string;
          mentorship_id: string;
          sender_id: string;
          body: string;
          created_at: string;
        };
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
      mentorships: {
        Row: {
          id: string;
          mentor_id: string;
          student_id: string;
          request_id: string | null;
          status: string;
          started_at: string;
          ends_at: string;
          ended_at: string | null;
          end_reason: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          mentor_id: string;
          student_id: string;
          request_id?: string | null;
          status?: string;
          started_at?: string;
          ends_at?: string;
          ended_at?: string | null;
          end_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          mentor_id?: string;
          student_id?: string;
          request_id?: string | null;
          status?: string;
          started_at?: string;
          ends_at?: string;
          ended_at?: string | null;
          end_reason?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
  };
};

export type ProfileRow = Database['public']['Tables']['profiles']['Row'];
export type MentorshipRow = Database['public']['Tables']['mentorships']['Row'];
export type MentorshipRequestRow = Database['public']['Tables']['mentorship_requests']['Row'];
export type UserPreferencesRow = Database['public']['Tables']['user_preferences']['Row'];
export type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];
export type NotificationPreferencesRow =
  Database['public']['Tables']['notification_preferences']['Row'];
export type NotificationRow = Database['public']['Tables']['notifications']['Row'];
export type CVRow = Database['public']['Tables']['cvs']['Row'];
export type CVPaymentRow = Database['public']['Tables']['cv_payments']['Row'];
