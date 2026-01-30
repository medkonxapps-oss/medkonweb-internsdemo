export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      approval_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          assigned_to: string | null
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          rejection_reason: string | null
          request_type: string
          requested_by: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          request_type: string
          requested_by: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          rejection_reason?: string | null
          request_type?: string
          requested_by?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          og_image: string | null
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["blog_status"]
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          og_image?: string | null
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["blog_status"]
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      campaign_events: {
        Row: {
          campaign_id: string | null
          created_at: string
          event_type: string
          id: string
          ip_address: string | null
          link_url: string | null
          recipient_email: string | null
          user_agent: string | null
        }
        Insert: {
          campaign_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          recipient_email?: string | null
          user_agent?: string | null
        }
        Update: {
          campaign_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          ip_address?: string | null
          link_url?: string | null
          recipient_email?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_events_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "scheduled_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body: string
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_default: boolean | null
          name: string
          subject: string
          updated_at: string
        }
        Insert: {
          body: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          subject: string
          updated_at?: string
        }
        Update: {
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
      }
      email_workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_type: string
          trigger_value: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_type?: string
          trigger_value?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_type?: string
          trigger_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: Database["public"]["Enums"]["lead_status"]
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          updated_at?: string
        }
        Relationships: []
      }
      link_clicks: {
        Row: {
          campaign_id: string | null
          click_count: number | null
          created_at: string
          first_clicked_at: string | null
          id: string
          last_clicked_at: string | null
          link_text: string | null
          link_url: string
          unique_clicks: number | null
        }
        Insert: {
          campaign_id?: string | null
          click_count?: number | null
          created_at?: string
          first_clicked_at?: string | null
          id?: string
          last_clicked_at?: string | null
          link_text?: string | null
          link_url: string
          unique_clicks?: number | null
        }
        Update: {
          campaign_id?: string | null
          click_count?: number | null
          created_at?: string
          first_clicked_at?: string | null
          id?: string
          last_clicked_at?: string | null
          link_text?: string | null
          link_url?: string
          unique_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "scheduled_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          custom_fields: Json | null
          email: string
          id: string
          name: string | null
          source: string | null
          subscribed: boolean
          unsubscribe_token: string | null
          unsubscribed_at: string | null
        }
        Insert: {
          created_at?: string
          custom_fields?: Json | null
          email: string
          id?: string
          name?: string | null
          source?: string | null
          subscribed?: boolean
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Update: {
          created_at?: string
          custom_fields?: Json | null
          email?: string
          id?: string
          name?: string | null
          source?: string | null
          subscribed?: boolean
          unsubscribe_token?: string | null
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      plugin_downloads: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          plugin_id: string
          sent_at: string | null
          status: Database["public"]["Enums"]["download_status"]
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          plugin_id: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["download_status"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          plugin_id?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["download_status"]
        }
        Relationships: [
          {
            foreignKeyName: "plugin_downloads_plugin_id_fkey"
            columns: ["plugin_id"]
            isOneToOne: false
            referencedRelation: "plugins"
            referencedColumns: ["id"]
          },
        ]
      }
      plugins: {
        Row: {
          auto_send: boolean
          created_at: string
          description: string | null
          download_count: number
          features: string[] | null
          file_url: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          tech_stack: string[] | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["plugin_type"]
          updated_at: string
          version: string | null
        }
        Insert: {
          auto_send?: boolean
          created_at?: string
          description?: string | null
          download_count?: number
          features?: string[] | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["plugin_type"]
          updated_at?: string
          version?: string | null
        }
        Update: {
          auto_send?: boolean
          created_at?: string
          description?: string | null
          download_count?: number
          features?: string[] | null
          file_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          tech_stack?: string[] | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["plugin_type"]
          updated_at?: string
          version?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          category: string | null
          challenge: string | null
          client: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          featured_image: string | null
          id: string
          images: string[] | null
          is_featured: boolean
          results: string | null
          slug: string
          solution: string | null
          status: Database["public"]["Enums"]["project_status"]
          tech_stack: string[] | null
          title: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          category?: string | null
          challenge?: string | null
          client?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          results?: string | null
          slug: string
          solution?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          title: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          category?: string | null
          challenge?: string | null
          client?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          featured_image?: string | null
          id?: string
          images?: string[] | null
          is_featured?: boolean
          results?: string | null
          slug?: string
          solution?: string | null
          status?: Database["public"]["Enums"]["project_status"]
          tech_stack?: string[] | null
          title?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      scheduled_campaigns: {
        Row: {
          body: string
          click_count: number
          created_at: string
          created_by: string | null
          error_message: string | null
          id: string
          is_recurring: boolean | null
          last_sent_at: string | null
          next_scheduled_at: string | null
          open_count: number
          parent_campaign_id: string | null
          recipient_count: number
          recurrence_end_date: string | null
          recurrence_pattern: string | null
          scheduled_at: string
          sent_at: string | null
          status: string
          subject: string
          tracking_id: string | null
        }
        Insert: {
          body: string
          click_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          open_count?: number
          parent_campaign_id?: string | null
          recipient_count?: number
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          scheduled_at: string
          sent_at?: string | null
          status?: string
          subject: string
          tracking_id?: string | null
        }
        Update: {
          body?: string
          click_count?: number
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          id?: string
          is_recurring?: boolean | null
          last_sent_at?: string | null
          next_scheduled_at?: string | null
          open_count?: number
          parent_campaign_id?: string | null
          recipient_count?: number
          recurrence_end_date?: string | null
          recurrence_pattern?: string | null
          scheduled_at?: string
          sent_at?: string | null
          status?: string
          subject?: string
          tracking_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_campaigns_parent_campaign_id_fkey"
            columns: ["parent_campaign_id"]
            isOneToOne: false
            referencedRelation: "scheduled_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_automation_rules: {
        Row: {
          created_at: string
          field: string
          id: string
          is_active: boolean
          name: string
          operator: string
          segment_id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          field: string
          id?: string
          is_active?: boolean
          name: string
          operator: string
          segment_id: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          field?: string
          id?: string
          is_active?: boolean
          name?: string
          operator?: string
          segment_id?: string
          updated_at?: string
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_automation_rules_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      subscriber_segment_members: {
        Row: {
          created_at: string
          id: string
          segment_id: string
          subscriber_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          segment_id: string
          subscriber_id: string
        }
        Update: {
          created_at?: string
          id?: string
          segment_id?: string
          subscriber_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriber_segment_members_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "subscriber_segments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriber_segment_members_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriber_segments: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          is_automated: boolean | null
          priority: string
          related_id: string | null
          related_type: string | null
          status: string
          title: string
          updated_at: string
          workflow_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_automated?: boolean | null
          priority?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title: string
          updated_at?: string
          workflow_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          is_automated?: boolean | null
          priority?: string
          related_id?: string | null
          related_type?: string | null
          status?: string
          title?: string
          updated_at?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "email_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          company: string | null
          content: string
          created_at: string
          id: string
          is_active: boolean | null
          is_featured: boolean | null
          name: string
          rating: number | null
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          content: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_featured?: boolean | null
          name?: string
          rating?: number | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          current_step: number
          id: string
          metadata: Json | null
          next_step_at: string | null
          started_at: string
          status: string
          subscriber_id: string
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step?: number
          id?: string
          metadata?: Json | null
          next_step_at?: string | null
          started_at?: string
          status?: string
          subscriber_id: string
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          current_step?: number
          id?: string
          metadata?: Json | null
          next_step_at?: string | null
          started_at?: string
          status?: string
          subscriber_id?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_subscriber_id_fkey"
            columns: ["subscriber_id"]
            isOneToOne: false
            referencedRelation: "newsletter_subscribers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "email_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rule_logs: {
        Row: {
          actions_executed: Json | null
          created_at: string
          entity_id: string
          entity_type: string
          error_message: string | null
          id: string
          rule_id: string
          status: string
        }
        Insert: {
          actions_executed?: Json | null
          created_at?: string
          entity_id: string
          entity_type: string
          error_message?: string | null
          id?: string
          rule_id: string
          status?: string
        }
        Update: {
          actions_executed?: Json | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          error_message?: string | null
          id?: string
          rule_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_rule_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "workflow_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_entity: string
          trigger_event: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_entity: string
          trigger_event: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_entity?: string
          trigger_event?: string
          updated_at?: string
        }
        Relationships: []
      }
      workflow_step_logs: {
        Row: {
          error_message: string | null
          execution_id: string
          id: string
          sent_at: string
          status: string
          step_id: string
        }
        Insert: {
          error_message?: string | null
          execution_id: string
          id?: string
          sent_at?: string
          status?: string
          step_id: string
        }
        Update: {
          error_message?: string | null
          execution_id?: string
          id?: string
          sent_at?: string
          status?: string
          step_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_step_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_step_logs_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "workflow_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_steps: {
        Row: {
          body: string
          condition_field: string | null
          condition_operator: string | null
          condition_value: string | null
          created_at: string
          delay_unit: string
          delay_value: number
          id: string
          name: string
          step_order: number
          subject: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          body: string
          condition_field?: string | null
          condition_operator?: string | null
          condition_value?: string | null
          created_at?: string
          delay_unit?: string
          delay_value?: number
          id?: string
          name: string
          step_order?: number
          subject: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          body?: string
          condition_field?: string | null
          condition_operator?: string | null
          condition_value?: string | null
          created_at?: string
          delay_unit?: string
          delay_value?: number
          id?: string
          name?: string
          step_order?: number
          subject?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "email_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_automated_task: {
        Args: {
          p_assigned_to: string
          p_description: string
          p_due_date?: string
          p_priority?: string
          p_related_id?: string
          p_related_type?: string
          p_title: string
        }
        Returns: string
      }
      create_notification: {
        Args: {
          p_link?: string
          p_message: string
          p_title: string
          p_type?: string
          p_user_id: string
        }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_campaign_click: {
        Args: { campaign_uuid: string }
        Returns: undefined
      }
      increment_campaign_open: {
        Args: { campaign_uuid: string }
        Returns: undefined
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      start_workflow_for_subscriber: {
        Args: { p_subscriber_id: string; p_workflow_id: string }
        Returns: string
      }
      track_link_click: {
        Args: {
          p_campaign_id: string
          p_link_text?: string
          p_link_url: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "super_admin" | "admin" | "team_member"
      blog_status: "draft" | "published" | "archived"
      download_status: "pending" | "approved" | "rejected" | "sent"
      lead_status: "new" | "contacted" | "qualified" | "converted" | "lost"
      plugin_type: "wordpress" | "chrome" | "figma"
      project_status: "planning" | "in_progress" | "completed" | "on_hold"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "admin", "team_member"],
      blog_status: ["draft", "published", "archived"],
      download_status: ["pending", "approved", "rejected", "sent"],
      lead_status: ["new", "contacted", "qualified", "converted", "lost"],
      plugin_type: ["wordpress", "chrome", "figma"],
      project_status: ["planning", "in_progress", "completed", "on_hold"],
    },
  },
} as const
