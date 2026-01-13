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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          id: string
          metadata: Json | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_conversations: {
        Row: {
          contact_id: string | null
          context: Json | null
          conversation_type: string
          created_at: string | null
          id: string
          messages: Json
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          context?: Json | null
          conversation_type: string
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          context?: Json | null
          conversation_type?: string
          created_at?: string | null
          id?: string
          messages?: Json
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      appointments: {
        Row: {
          contact_id: string | null
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          location: string | null
          meeting_url: string | null
          reminder_sent: boolean | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          reminder_sent?: boolean | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          reminder_sent?: boolean | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_slots: {
        Row: {
          created_at: string | null
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          start_time: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          start_time: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          start_time?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "availability_slots_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_number: string
          contact_id: string | null
          created_at: string | null
          id: string
          number_of_travelers: number
          package_id: string | null
          paid_amount: number | null
          return_date: string | null
          special_requests: string | null
          status: string
          total_amount: number
          travel_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_number: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          number_of_travelers?: number
          package_id?: string | null
          paid_amount?: number | null
          return_date?: string | null
          special_requests?: string | null
          status?: string
          total_amount: number
          travel_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_number?: string
          contact_id?: string | null
          created_at?: string | null
          id?: string
          number_of_travelers?: number
          package_id?: string | null
          paid_amount?: number | null
          return_date?: string | null
          special_requests?: string | null
          status?: string
          total_amount?: number
          travel_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "travel_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      calls: {
        Row: {
          contact_id: string | null
          created_at: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds: number | null
          ended_at: string | null
          id: string
          notes: string | null
          phone_number: string
          recording_url: string | null
          started_at: string | null
          transcription: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string | null
          direction: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number: string
          recording_url?: string | null
          started_at?: string | null
          transcription?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string | null
          direction?: Database["public"]["Enums"]["call_direction"]
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          notes?: string | null
          phone_number?: string
          recording_url?: string | null
          started_at?: string | null
          transcription?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "calls_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calls_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_contacts: {
        Row: {
          bounced: boolean | null
          campaign_id: string
          clicked_at: string | null
          contact_id: string
          created_at: string | null
          delivered_at: string | null
          id: string
          opened_at: string | null
          sent_at: string | null
        }
        Insert: {
          bounced?: boolean | null
          campaign_id: string
          clicked_at?: string | null
          contact_id: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Update: {
          bounced?: boolean | null
          campaign_id?: string
          clicked_at?: string | null
          contact_id?: string
          created_at?: string | null
          delivered_at?: string | null
          id?: string
          opened_at?: string | null
          sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_contacts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["campaign_status"] | null
          subject: string | null
          total_clicked: number | null
          total_delivered: number | null
          total_opened: number | null
          total_sent: number | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject?: string | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["campaign_status"] | null
          subject?: string | null
          total_clicked?: number | null
          total_delivered?: number | null
          total_opened?: number | null
          total_sent?: number | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_activities: {
        Row: {
          activity_data: Json | null
          activity_type: string
          contact_id: string
          created_at: string
          id: string
          ip_address: string | null
          referrer: string | null
          user_agent: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          activity_data?: Json | null
          activity_type: string
          contact_id: string
          created_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          activity_data?: Json | null
          activity_type?: string
          contact_id?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          user_agent?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_scores: {
        Row: {
          calculated_at: string
          contact_id: string
          id: string
          score_factors: Json | null
          score_type: string
          score_value: number
        }
        Insert: {
          calculated_at?: string
          contact_id: string
          id?: string
          score_factors?: Json | null
          score_type: string
          score_value?: number
        }
        Update: {
          calculated_at?: string
          contact_id?: string
          id?: string
          score_factors?: Json | null
          score_type?: string
          score_value?: number
        }
        Relationships: [
          {
            foreignKeyName: "contact_scores_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_tags: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          tag_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          tag_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_tags_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          address: string | null
          annual_revenue: string | null
          average_deal_size: number | null
          bounce_count: number | null
          city: string | null
          company: string | null
          company_size: string | null
          complaint_count: number | null
          conversion_date: string | null
          country: string | null
          created_at: string | null
          custom_fields: Json | null
          customer_lifetime_value: number | null
          email: string | null
          email_verified: boolean | null
          first_name: string
          id: string
          industry: string | null
          interests: string[] | null
          job_function: string | null
          language: string | null
          last_activity_at: string | null
          last_contacted_at: string | null
          last_email_clicked_at: string | null
          last_email_opened_at: string | null
          last_name: string
          last_website_visit_at: string | null
          lead_score: number | null
          lead_temperature: string | null
          lifecycle_stage: string | null
          marketing_consent: boolean | null
          pain_points: string[] | null
          phone: string | null
          phone_verified: boolean | null
          preferred_contact_method: string | null
          sms_consent: boolean | null
          social_profiles: Json | null
          source: string | null
          state: string | null
          status: string | null
          timezone: string | null
          title: string | null
          total_email_clicks: number | null
          total_email_opens: number | null
          total_messages_received: number | null
          total_messages_sent: number | null
          unsubscribed_at: string | null
          updated_at: string | null
          user_id: string
          website_visits: number | null
          whatsapp_consent: boolean | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          annual_revenue?: string | null
          average_deal_size?: number | null
          bounce_count?: number | null
          city?: string | null
          company?: string | null
          company_size?: string | null
          complaint_count?: number | null
          conversion_date?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          customer_lifetime_value?: number | null
          email?: string | null
          email_verified?: boolean | null
          first_name: string
          id?: string
          industry?: string | null
          interests?: string[] | null
          job_function?: string | null
          language?: string | null
          last_activity_at?: string | null
          last_contacted_at?: string | null
          last_email_clicked_at?: string | null
          last_email_opened_at?: string | null
          last_name: string
          last_website_visit_at?: string | null
          lead_score?: number | null
          lead_temperature?: string | null
          lifecycle_stage?: string | null
          marketing_consent?: boolean | null
          pain_points?: string[] | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_contact_method?: string | null
          sms_consent?: boolean | null
          social_profiles?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          timezone?: string | null
          title?: string | null
          total_email_clicks?: number | null
          total_email_opens?: number | null
          total_messages_received?: number | null
          total_messages_sent?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id: string
          website_visits?: number | null
          whatsapp_consent?: boolean | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          annual_revenue?: string | null
          average_deal_size?: number | null
          bounce_count?: number | null
          city?: string | null
          company?: string | null
          company_size?: string | null
          complaint_count?: number | null
          conversion_date?: string | null
          country?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          customer_lifetime_value?: number | null
          email?: string | null
          email_verified?: boolean | null
          first_name?: string
          id?: string
          industry?: string | null
          interests?: string[] | null
          job_function?: string | null
          language?: string | null
          last_activity_at?: string | null
          last_contacted_at?: string | null
          last_email_clicked_at?: string | null
          last_email_opened_at?: string | null
          last_name?: string
          last_website_visit_at?: string | null
          lead_score?: number | null
          lead_temperature?: string | null
          lifecycle_stage?: string | null
          marketing_consent?: boolean | null
          pain_points?: string[] | null
          phone?: string | null
          phone_verified?: boolean | null
          preferred_contact_method?: string | null
          sms_consent?: boolean | null
          social_profiles?: Json | null
          source?: string | null
          state?: string | null
          status?: string | null
          timezone?: string | null
          title?: string | null
          total_email_clicks?: number | null
          total_email_opens?: number | null
          total_messages_received?: number | null
          total_messages_sent?: number | null
          unsubscribed_at?: string | null
          updated_at?: string | null
          user_id?: string
          website_visits?: number | null
          whatsapp_consent?: boolean | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          contact_id: string
          course_id: string
          enrolled_at: string | null
          id: string
          progress: number | null
        }
        Insert: {
          completed_at?: string | null
          contact_id: string
          course_id: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
        }
        Update: {
          completed_at?: string | null
          contact_id?: string
          course_id?: string
          enrolled_at?: string | null
          id?: string
          progress?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_published: boolean | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_published?: boolean | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      deals: {
        Row: {
          actual_close_date: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          expected_close_date: string | null
          id: string
          pipeline: string | null
          probability: number | null
          stage: Database["public"]["Enums"]["deal_stage"] | null
          title: string
          updated_at: string | null
          user_id: string
          value: number | null
        }
        Insert: {
          actual_close_date?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          pipeline?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          title: string
          updated_at?: string | null
          user_id: string
          value?: number | null
        }
        Update: {
          actual_close_date?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          expected_close_date?: string | null
          id?: string
          pipeline?: string | null
          probability?: number | null
          stage?: Database["public"]["Enums"]["deal_stage"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "deals_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      destinations: {
        Row: {
          average_temperature: string | null
          best_time_to_visit: string | null
          country: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          language: string | null
          name: string
          popular_attractions: string[] | null
          updated_at: string | null
          user_id: string
          visa_requirements: string | null
        }
        Insert: {
          average_temperature?: string | null
          best_time_to_visit?: string | null
          country: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name: string
          popular_attractions?: string[] | null
          updated_at?: string | null
          user_id: string
          visa_requirements?: string | null
        }
        Update: {
          average_temperature?: string | null
          best_time_to_visit?: string | null
          country?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          language?: string | null
          name?: string
          popular_attractions?: string[] | null
          updated_at?: string | null
          user_id?: string
          visa_requirements?: string | null
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body: string
          created_at: string | null
          id: string
          name: string
          subject: string
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          body: string
          created_at?: string | null
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          body?: string
          created_at?: string | null
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "email_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          contact_id: string | null
          created_at: string
          form_id: string
          id: string
          ip_address: string | null
          referrer: string | null
          status: string | null
          submission_data: Json
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          form_id: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          status?: string | null
          submission_data: Json
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          form_id?: string
          id?: string
          ip_address?: string | null
          referrer?: string | null
          status?: string | null
          submission_data?: Json
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "lead_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      integrations: {
        Row: {
          created_at: string
          credentials: Json
          error_message: string | null
          id: string
          last_sync_at: string | null
          metadata: Json | null
          platform: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credentials?: Json
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credentials?: Json
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          metadata?: Json | null
          platform?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string
          product_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id: string
          product_id?: string | null
          quantity?: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string
          product_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          atol_certificate_number: string | null
          atol_expiry_date: string | null
          atol_holder_name: string | null
          bank_details: string | null
          color_scheme: Json | null
          company_details: string | null
          company_logo_url: string | null
          created_at: string | null
          description: string | null
          footer_text: string | null
          id: string
          include_atol: boolean | null
          is_default: boolean | null
          name: string
          payment_terms: string | null
          template_html: string
          terms_and_conditions: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          atol_certificate_number?: string | null
          atol_expiry_date?: string | null
          atol_holder_name?: string | null
          bank_details?: string | null
          color_scheme?: Json | null
          company_details?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          id?: string
          include_atol?: boolean | null
          is_default?: boolean | null
          name: string
          payment_terms?: string | null
          template_html: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          atol_certificate_number?: string | null
          atol_expiry_date?: string | null
          atol_holder_name?: string | null
          bank_details?: string | null
          color_scheme?: Json | null
          company_details?: string | null
          company_logo_url?: string | null
          created_at?: string | null
          description?: string | null
          footer_text?: string | null
          id?: string
          include_atol?: boolean | null
          is_default?: boolean | null
          name?: string
          payment_terms?: string | null
          template_html?: string
          terms_and_conditions?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          atol_certificate_url: string | null
          contact_id: string | null
          created_at: string | null
          due_date: string
          id: string
          includes_atol: boolean | null
          invoice_number: string
          notes: string | null
          paid_at: string | null
          pdf_url: string | null
          status: Database["public"]["Enums"]["invoice_status"] | null
          tax_amount: number | null
          template_id: string | null
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          atol_certificate_url?: string | null
          contact_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          includes_atol?: boolean | null
          invoice_number: string
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tax_amount?: number | null
          template_id?: string | null
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          atol_certificate_url?: string | null
          contact_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          includes_atol?: boolean | null
          invoice_number?: string
          notes?: string | null
          paid_at?: string | null
          pdf_url?: string | null
          status?: Database["public"]["Enums"]["invoice_status"] | null
          tax_amount?: number | null
          template_id?: string | null
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      itineraries: {
        Row: {
          booking_id: string | null
          created_at: string | null
          description: string | null
          destinations: string[] | null
          end_date: string
          id: string
          name: string
          package_id: string | null
          start_date: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          destinations?: string[] | null
          end_date: string
          id?: string
          name: string
          package_id?: string | null
          start_date: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          destinations?: string[] | null
          end_date?: string
          id?: string
          name?: string
          package_id?: string | null
          start_date?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "itineraries_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "itineraries_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "travel_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      itinerary_items: {
        Row: {
          activity_type: string | null
          booking_reference: string | null
          created_at: string | null
          day_number: number
          description: string | null
          end_time: string | null
          id: string
          itinerary_id: string
          location: string | null
          notes: string | null
          start_time: string | null
          title: string
        }
        Insert: {
          activity_type?: string | null
          booking_reference?: string | null
          created_at?: string | null
          day_number: number
          description?: string | null
          end_time?: string | null
          id?: string
          itinerary_id: string
          location?: string | null
          notes?: string | null
          start_time?: string | null
          title: string
        }
        Update: {
          activity_type?: string | null
          booking_reference?: string | null
          created_at?: string | null
          day_number?: number
          description?: string | null
          end_time?: string | null
          id?: string
          itinerary_id?: string
          location?: string | null
          notes?: string | null
          start_time?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "itinerary_items_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "itineraries"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_forms: {
        Row: {
          conversion_rate: number | null
          created_at: string
          description: string | null
          embed_code: string | null
          fields: Json
          id: string
          is_active: boolean | null
          name: string
          settings: Json | null
          submissions_count: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name: string
          settings?: Json | null
          submissions_count?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          conversion_rate?: number | null
          created_at?: string
          description?: string | null
          embed_code?: string | null
          fields?: Json
          id?: string
          is_active?: boolean | null
          name?: string
          settings?: Json | null
          submissions_count?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      lead_sources: {
        Row: {
          captured_at: string
          contact_id: string
          created_at: string
          id: string
          metadata: Json | null
          source_ad_id: string | null
          source_campaign: string | null
          source_form_id: string | null
          source_platform: string
        }
        Insert: {
          captured_at?: string
          contact_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          source_ad_id?: string | null
          source_campaign?: string | null
          source_form_id?: string | null
          source_platform: string
        }
        Update: {
          captured_at?: string
          contact_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          source_ad_id?: string | null
          source_campaign?: string | null
          source_form_id?: string | null
          source_platform?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_sources_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          enrollment_id: string
          id: string
          lesson_id: string
          watch_time_minutes: number | null
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          enrollment_id: string
          id?: string
          lesson_id: string
          watch_time_minutes?: number | null
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          enrollment_id?: string
          id?: string
          lesson_id?: string
          watch_time_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "course_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content: string | null
          course_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number
          title: string
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          content?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index: number
          title: string
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          content?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number
          title?: string
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lessons_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          contact_id: string | null
          created_at: string
          direction: string
          external_message_id: string | null
          id: string
          integration_id: string | null
          is_read: boolean
          message_text: string | null
          metadata: Json | null
          platform: string
          received_at: string
          responded: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          direction?: string
          external_message_id?: string | null
          id?: string
          integration_id?: string | null
          is_read?: boolean
          message_text?: string | null
          metadata?: Json | null
          platform: string
          received_at?: string
          responded?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          direction?: string
          external_message_id?: string | null
          id?: string
          integration_id?: string | null
          is_read?: boolean
          message_text?: string | null
          metadata?: Json | null
          platform?: string
          received_at?: string
          responded?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          contact_id: string | null
          content: string
          created_at: string | null
          deal_id: string | null
          id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          contact_id?: string | null
          content: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string | null
          content?: string
          created_at?: string | null
          deal_id?: string | null
          id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          contact_id: string | null
          created_at: string | null
          id: string
          invoice_id: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          status: string | null
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contact_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contact_id?: string | null
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          status?: string | null
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          billing_interval: string | null
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          is_recurring: boolean | null
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name: string
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          billing_interval?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_recurring?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      review_requests: {
        Row: {
          contact_id: string
          created_at: string | null
          id: string
          platform: string
          rating: number | null
          responded_at: string | null
          sent_at: string | null
          user_id: string
        }
        Insert: {
          contact_id: string
          created_at?: string | null
          id?: string
          platform: string
          rating?: number | null
          responded_at?: string | null
          sent_at?: string | null
          user_id: string
        }
        Update: {
          contact_id?: string
          created_at?: string | null
          id?: string
          platform?: string
          rating?: number | null
          responded_at?: string | null
          sent_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_requests_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          contact_id: string | null
          created_at: string | null
          id: string
          platform: string
          rating: number
          review_url: string | null
          reviewer_name: string | null
          user_id: string
        }
        Insert: {
          comment?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform: string
          rating: number
          review_url?: string | null
          reviewer_name?: string | null
          user_id: string
        }
        Update: {
          comment?: string | null
          contact_id?: string | null
          created_at?: string | null
          id?: string
          platform?: string
          rating?: number
          review_url?: string | null
          reviewer_name?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      segment_contacts: {
        Row: {
          added_at: string
          contact_id: string
          id: string
          segment_id: string
        }
        Insert: {
          added_at?: string
          contact_id: string
          id?: string
          segment_id: string
        }
        Update: {
          added_at?: string
          contact_id?: string
          id?: string
          segment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "segment_contacts_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "segment_contacts_segment_id_fkey"
            columns: ["segment_id"]
            isOneToOne: false
            referencedRelation: "segments"
            referencedColumns: ["id"]
          },
        ]
      }
      segments: {
        Row: {
          created_at: string
          description: string | null
          filters: Json
          id: string
          is_dynamic: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_dynamic?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          filters?: Json
          id?: string
          is_dynamic?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sequence_steps: {
        Row: {
          created_at: string | null
          delay_days: number
          id: string
          order_index: number
          sequence_id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string | null
          delay_days: number
          id?: string
          order_index: number
          sequence_id: string
          template_id?: string | null
        }
        Update: {
          created_at?: string | null
          delay_days?: number
          id?: string
          order_index?: number
          sequence_id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sequence_steps_sequence_id_fkey"
            columns: ["sequence_id"]
            isOneToOne: false
            referencedRelation: "sequences"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sequence_steps_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "email_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sequences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sms_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
          user_id: string
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
          user_id: string
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
          user_id?: string
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sms_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          deal_id: string | null
          description: string | null
          due_date: string | null
          id: string
          priority: Database["public"]["Enums"]["priority_level"] | null
          status: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          deal_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["priority_level"] | null
          status?: Database["public"]["Enums"]["task_status"] | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_packages: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          destination: string
          duration_days: number
          id: string
          image_url: string | null
          included_services: string[] | null
          is_active: boolean | null
          max_travelers: number | null
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          destination: string
          duration_days: number
          id?: string
          image_url?: string | null
          included_services?: string[] | null
          is_active?: boolean | null
          max_travelers?: number | null
          name: string
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          destination?: string
          duration_days?: number
          id?: string
          image_url?: string | null
          included_services?: string[] | null
          is_active?: boolean | null
          max_travelers?: number | null
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      travelers: {
        Row: {
          booking_id: string
          created_at: string | null
          date_of_birth: string | null
          email: string | null
          first_name: string
          id: string
          last_name: string
          nationality: string | null
          passport_expiry: string | null
          passport_number: string | null
          phone: string | null
        }
        Insert: {
          booking_id: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
        }
        Update: {
          booking_id?: string
          created_at?: string | null
          date_of_birth?: string | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          nationality?: string | null
          passport_expiry?: string | null
          passport_number?: string | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "travelers_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_actions: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string | null
          delay_minutes: number | null
          id: string
          order_index: number
          workflow_id: string
        }
        Insert: {
          action_config: Json
          action_type: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          order_index: number
          workflow_id: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string | null
          delay_minutes?: number | null
          id?: string
          order_index?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_actions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_runs: {
        Row: {
          completed_at: string | null
          contact_id: string | null
          error_message: string | null
          id: string
          started_at: string | null
          status: string | null
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          contact_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          contact_id?: string | null
          error_message?: string | null
          id?: string
          started_at?: string | null
          status?: string | null
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_runs_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workflow_runs_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workflows: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["workflow_status"] | null
          trigger_config: Json | null
          trigger_type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_config?: Json | null
          trigger_type: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["workflow_status"] | null
          trigger_config?: Json | null
          trigger_type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflows_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "manager" | "agent" | "viewer"
      appointment_status:
        | "scheduled"
        | "confirmed"
        | "completed"
        | "cancelled"
        | "no_show"
      call_direction: "inbound" | "outbound"
      campaign_status:
        | "draft"
        | "scheduled"
        | "active"
        | "completed"
        | "cancelled"
      deal_stage:
        | "lead"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      payment_method: "card" | "bank_transfer" | "cash" | "other"
      priority_level: "low" | "medium" | "high" | "urgent"
      task_status: "pending" | "in_progress" | "completed" | "cancelled"
      workflow_status: "draft" | "active" | "paused" | "archived"
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
      app_role: ["admin", "manager", "agent", "viewer"],
      appointment_status: [
        "scheduled",
        "confirmed",
        "completed",
        "cancelled",
        "no_show",
      ],
      call_direction: ["inbound", "outbound"],
      campaign_status: [
        "draft",
        "scheduled",
        "active",
        "completed",
        "cancelled",
      ],
      deal_stage: [
        "lead",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      payment_method: ["card", "bank_transfer", "cash", "other"],
      priority_level: ["low", "medium", "high", "urgent"],
      task_status: ["pending", "in_progress", "completed", "cancelled"],
      workflow_status: ["draft", "active", "paused", "archived"],
    },
  },
} as const
