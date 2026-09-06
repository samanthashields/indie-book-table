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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity: {
        Row: {
          actor_name: string | null
          actor_user_id: string | null
          book_id: string
          created_at: string
          id: string
          text: string
        }
        Insert: {
          actor_name?: string | null
          actor_user_id?: string | null
          book_id: string
          created_at?: string
          id?: string
          text: string
        }
        Update: {
          actor_name?: string | null
          actor_user_id?: string | null
          book_id?: string
          created_at?: string
          id?: string
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      books: {
        Row: {
          attachments: Json
          audience: string | null
          author_id: string
          budget: number | null
          comparables: string | null
          cover_url: string | null
          created_at: string
          edition: string | null
          genre: string | null
          goals: string | null
          has_cycle: boolean
          id: string
          imprint: string | null
          isbn: string | null
          language: string | null
          length_estimate: string | null
          metadata: Json
          pen_name: string | null
          price: string | null
          publishing_path: string | null
          series: string | null
          shelf_status: string
          start_date: string | null
          status: string
          subtitle: string | null
          target_publication_date: string | null
          template_id: string | null
          title: string
          trim_size: string | null
          updated_at: string
        }
        Insert: {
          attachments?: Json
          audience?: string | null
          author_id: string
          budget?: number | null
          comparables?: string | null
          cover_url?: string | null
          created_at?: string
          edition?: string | null
          genre?: string | null
          goals?: string | null
          has_cycle?: boolean
          id?: string
          imprint?: string | null
          isbn?: string | null
          language?: string | null
          length_estimate?: string | null
          metadata?: Json
          pen_name?: string | null
          price?: string | null
          publishing_path?: string | null
          series?: string | null
          shelf_status?: string
          start_date?: string | null
          status?: string
          subtitle?: string | null
          target_publication_date?: string | null
          template_id?: string | null
          title: string
          trim_size?: string | null
          updated_at?: string
        }
        Update: {
          attachments?: Json
          audience?: string | null
          author_id?: string
          budget?: number | null
          comparables?: string | null
          cover_url?: string | null
          created_at?: string
          edition?: string | null
          genre?: string | null
          goals?: string | null
          has_cycle?: boolean
          id?: string
          imprint?: string | null
          isbn?: string | null
          language?: string | null
          length_estimate?: string | null
          metadata?: Json
          pen_name?: string | null
          price?: string | null
          publishing_path?: string | null
          series?: string | null
          shelf_status?: string
          start_date?: string | null
          status?: string
          subtitle?: string | null
          target_publication_date?: string | null
          template_id?: string | null
          title?: string
          trim_size?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      catalog_authors: {
        Row: {
          bio: string | null
          created_at: string
          email: string
          id: string
          instagram_handle: string | null
          name: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          email: string
          id?: string
          instagram_handle?: string | null
          name: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          email?: string
          id?: string
          instagram_handle?: string | null
          name?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      catalog_books: {
        Row: {
          ai_art_contribution: Database["public"]["Enums"]["ai_contribution"]
          ai_writing_contribution: Database["public"]["Enums"]["ai_contribution"]
          awards_reviews_text: string | null
          book_cycle_id: string | null
          catalog_author_id: string
          cover_designer: string | null
          cover_image_url: string | null
          ebook_price: number | null
          editors: string | null
          explicit_content: boolean
          genre: string | null
          hook: string | null
          id: string
          illustrators: string | null
          pen_name: string | null
          print_price: number | null
          removal_reason: string | null
          status: Database["public"]["Enums"]["catalog_book_status"]
          submitted_at: string
          tags: string[]
          target_audience: Database["public"]["Enums"]["target_audience"]
          times_featured_count: number
          title: string
          updated_at: string
        }
        Insert: {
          ai_art_contribution?: Database["public"]["Enums"]["ai_contribution"]
          ai_writing_contribution?: Database["public"]["Enums"]["ai_contribution"]
          awards_reviews_text?: string | null
          book_cycle_id?: string | null
          catalog_author_id: string
          cover_designer?: string | null
          cover_image_url?: string | null
          ebook_price?: number | null
          editors?: string | null
          explicit_content?: boolean
          genre?: string | null
          hook?: string | null
          id?: string
          illustrators?: string | null
          pen_name?: string | null
          print_price?: number | null
          removal_reason?: string | null
          status?: Database["public"]["Enums"]["catalog_book_status"]
          submitted_at?: string
          tags?: string[]
          target_audience?: Database["public"]["Enums"]["target_audience"]
          times_featured_count?: number
          title: string
          updated_at?: string
        }
        Update: {
          ai_art_contribution?: Database["public"]["Enums"]["ai_contribution"]
          ai_writing_contribution?: Database["public"]["Enums"]["ai_contribution"]
          awards_reviews_text?: string | null
          book_cycle_id?: string | null
          catalog_author_id?: string
          cover_designer?: string | null
          cover_image_url?: string | null
          ebook_price?: number | null
          editors?: string | null
          explicit_content?: boolean
          genre?: string | null
          hook?: string | null
          id?: string
          illustrators?: string | null
          pen_name?: string | null
          print_price?: number | null
          removal_reason?: string | null
          status?: Database["public"]["Enums"]["catalog_book_status"]
          submitted_at?: string
          tags?: string[]
          target_audience?: Database["public"]["Enums"]["target_audience"]
          times_featured_count?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_books_book_cycle_id_fkey"
            columns: ["book_cycle_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_books_catalog_author_id_fkey"
            columns: ["catalog_author_id"]
            isOneToOne: false
            referencedRelation: "catalog_authors"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_editorial_settings: {
        Row: {
          active_issue_id: string | null
          id: boolean
          updated_at: string
        }
        Insert: {
          active_issue_id?: string | null
          id?: boolean
          updated_at?: string
        }
        Update: {
          active_issue_id?: string | null
          id?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_editorial_settings_active_issue_id_fkey"
            columns: ["active_issue_id"]
            isOneToOne: false
            referencedRelation: "catalog_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_issue_page_themes: {
        Row: {
          background_image_url: string | null
          category: string
          created_at: string
          ground_color: string | null
          id: string
          issue_id: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          category: string
          created_at?: string
          ground_color?: string | null
          id?: string
          issue_id: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          category?: string
          created_at?: string
          ground_color?: string | null
          id?: string
          issue_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_issue_page_themes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "catalog_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_issue_quotas: {
        Row: {
          category: string
          created_at: string
          id: string
          issue_id: string
          quota: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          issue_id: string
          quota?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          issue_id?: string
          quota?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_issue_quotas_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "catalog_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_issue_selections: {
        Row: {
          catalog_book_id: string
          category: string
          created_at: string
          id: string
          is_spotlight: boolean
          issue_id: string
          notified_at: string | null
          order_index: number
          published_at: string | null
          spotlight_blurb: string | null
          spotlight_post_id: string | null
        }
        Insert: {
          catalog_book_id: string
          category: string
          created_at?: string
          id?: string
          is_spotlight?: boolean
          issue_id: string
          notified_at?: string | null
          order_index?: number
          published_at?: string | null
          spotlight_blurb?: string | null
          spotlight_post_id?: string | null
        }
        Update: {
          catalog_book_id?: string
          category?: string
          created_at?: string
          id?: string
          is_spotlight?: boolean
          issue_id?: string
          notified_at?: string | null
          order_index?: number
          published_at?: string | null
          spotlight_blurb?: string | null
          spotlight_post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "catalog_issue_selections_catalog_book_id_fkey"
            columns: ["catalog_book_id"]
            isOneToOne: false
            referencedRelation: "catalog_books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "catalog_issue_selections_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "catalog_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_issue_themes: {
        Row: {
          border_pattern: string
          cover_headline: string | null
          cover_image_url: string | null
          cover_tagline: string | null
          created_at: string
          issue_id: string
          preset: string
          updated_at: string
        }
        Insert: {
          border_pattern?: string
          cover_headline?: string | null
          cover_image_url?: string | null
          cover_tagline?: string | null
          created_at?: string
          issue_id: string
          preset?: string
          updated_at?: string
        }
        Update: {
          border_pattern?: string
          cover_headline?: string | null
          cover_image_url?: string | null
          cover_tagline?: string | null
          created_at?: string
          issue_id?: string
          preset?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_issue_themes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: true
            referencedRelation: "catalog_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_issues: {
        Row: {
          created_at: string
          display_label: string
          id: string
          issue_month: string
          published_at: string | null
          status: Database["public"]["Enums"]["issue_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_label: string
          id?: string
          issue_month: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_label?: string
          id?: string
          issue_month?: string
          published_at?: string | null
          status?: Database["public"]["Enums"]["issue_status"]
          updated_at?: string
        }
        Relationships: []
      }
      catalog_posts: {
        Row: {
          author_user_id: string | null
          body: string
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_user_id?: string | null
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_user_id?: string | null
          body?: string
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      catalog_purchase_links: {
        Row: {
          catalog_book_id: string
          created_at: string
          id: string
          platform_label: string
          url: string
        }
        Insert: {
          catalog_book_id: string
          created_at?: string
          id?: string
          platform_label: string
          url: string
        }
        Update: {
          catalog_book_id?: string
          created_at?: string
          id?: string
          platform_label?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "catalog_purchase_links_catalog_book_id_fkey"
            columns: ["catalog_book_id"]
            isOneToOne: false
            referencedRelation: "catalog_books"
            referencedColumns: ["id"]
          },
        ]
      }
      catalog_site_content: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      catalog_subscribers: {
        Row: {
          blog_opt_in: boolean
          catalog_opt_in: boolean
          email: string
          id: string
          subscribed_at: string
        }
        Insert: {
          blog_opt_in?: boolean
          catalog_opt_in?: boolean
          email: string
          id?: string
          subscribed_at?: string
        }
        Update: {
          blog_opt_in?: boolean
          catalog_opt_in?: boolean
          email?: string
          id?: string
          subscribed_at?: string
        }
        Relationships: []
      }
      catalog_wishlist_send_log: {
        Row: {
          email: string
          id: string
          sent_at: string
        }
        Insert: {
          email: string
          id?: string
          sent_at?: string
        }
        Update: {
          email?: string
          id?: string
          sent_at?: string
        }
        Relationships: []
      }
      coach_conversations: {
        Row: {
          book_id: string | null
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "coach_conversations_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      collaborators: {
        Row: {
          accepted_at: string | null
          book_id: string
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_at: string
          name: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          accepted_at?: string | null
          book_id: string
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_at?: string
          name?: string | null
          role: string
          status?: string
          user_id?: string | null
        }
        Update: {
          accepted_at?: string | null
          book_id?: string
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_at?: string
          name?: string | null
          role?: string
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaborators_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      help_articles: {
        Row: {
          body: string
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          id: string
          position: number
          published_at: string | null
          related_ids: string[]
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          summary: string | null
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          position?: number
          published_at?: string | null
          related_ids?: string[]
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          summary?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          id?: string
          position?: number
          published_at?: string | null
          related_ids?: string[]
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          summary?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "help_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "help_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      help_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      milestone_notes: {
        Row: {
          attachment_path: string | null
          author_user_id: string
          body: string
          created_at: string
          id: string
          milestone_id: string
        }
        Insert: {
          attachment_path?: string | null
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          milestone_id: string
        }
        Update: {
          attachment_path?: string | null
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_notes_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          approval_required: boolean
          book_id: string
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          instructions: string | null
          name: string
          owner: string | null
          owner_user_id: string | null
          phase_id: string
          position: number
          requirement_details: Json
          requirement_type: string | null
          resources: Json
          status: string
          updated_at: string
        }
        Insert: {
          approval_required?: boolean
          book_id: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          name: string
          owner?: string | null
          owner_user_id?: string | null
          phase_id: string
          position?: number
          requirement_details?: Json
          requirement_type?: string | null
          resources?: Json
          status?: string
          updated_at?: string
        }
        Update: {
          approval_required?: boolean
          book_id?: string
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          instructions?: string | null
          name?: string
          owner?: string | null
          owner_user_id?: string | null
          phase_id?: string
          position?: number
          requirement_details?: Json
          requirement_type?: string | null
          resources?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "phases"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          book_id: string | null
          created_at: string
          id: string
          kind: string
          link: string | null
          read_at: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          book_id?: string | null
          created_at?: string
          id?: string
          kind: string
          link?: string | null
          read_at?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          book_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          link?: string | null
          read_at?: string | null
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      pen_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          thread_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          thread_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pen_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "pen_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      pen_threads: {
        Row: {
          book_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          book_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          book_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pen_threads_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      phases: {
        Row: {
          book_id: string
          created_at: string
          id: string
          key: string
          name: string
          position: number
          status: string
          suggested_end: string | null
          suggested_start: string | null
          type: string
        }
        Insert: {
          book_id: string
          created_at?: string
          id?: string
          key: string
          name: string
          position?: number
          status?: string
          suggested_end?: string | null
          suggested_start?: string | null
          type?: string
        }
        Update: {
          book_id?: string
          created_at?: string
          id?: string
          key?: string
          name?: string
          position?: number
          status?: string
          suggested_end?: string | null
          suggested_start?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "phases_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          id: string
          pen_name: string | null
          plan: string
          suspended: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          pen_name?: string | null
          plan?: string
          suspended?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          pen_name?: string | null
          plan?: string
          suspended?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reflections: {
        Row: {
          achieved_goals: boolean | null
          book_id: string
          completed_at: string | null
          created_at: string
          custom: Json
          goals_notes: string | null
          id: string
          next_steps: string | null
          published_on_time: boolean | null
          updated_at: string
        }
        Insert: {
          achieved_goals?: boolean | null
          book_id: string
          completed_at?: string | null
          created_at?: string
          custom?: Json
          goals_notes?: string | null
          id?: string
          next_steps?: string | null
          published_on_time?: boolean | null
          updated_at?: string
        }
        Update: {
          achieved_goals?: boolean | null
          book_id?: string
          completed_at?: string | null
          created_at?: string
          custom?: Json
          goals_notes?: string | null
          id?: string
          next_steps?: string | null
          published_on_time?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reflections_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: true
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      release_notes: {
        Row: {
          body: string
          created_at: string
          highlight: boolean
          id: string
          label: string | null
          released_on: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          body?: string
          created_at?: string
          highlight?: boolean
          id?: string
          label?: string | null
          released_on?: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          highlight?: boolean
          id?: string
          label?: string | null
          released_on?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          attachment_path: string | null
          body: string
          created_at: string
          from_admin: boolean
          id: string
          sender_user_id: string
          ticket_id: string
        }
        Insert: {
          attachment_path?: string | null
          body: string
          created_at?: string
          from_admin?: boolean
          id?: string
          sender_user_id: string
          ticket_id: string
        }
        Update: {
          attachment_path?: string | null
          body?: string
          created_at?: string
          from_admin?: boolean
          id?: string
          sender_user_id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          archived: boolean
          audience: string | null
          created_at: string
          description: string | null
          details: Json
          duration: string | null
          genre: string | null
          id: string
          owner_id: string | null
          phases: Json
          position: number
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          archived?: boolean
          audience?: string | null
          created_at?: string
          description?: string | null
          details?: Json
          duration?: string | null
          genre?: string | null
          id?: string
          owner_id?: string | null
          phases?: Json
          position?: number
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          archived?: boolean
          audience?: string | null
          created_at?: string
          description?: string | null
          details?: Json
          duration?: string | null
          genre?: string | null
          id?: string
          owner_id?: string | null
          phases?: Json
          position?: number
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      catalog_author_is_published: {
        Args: { _author_id: string }
        Returns: boolean
      }
      catalog_book_is_published: {
        Args: { _book_id: string }
        Returns: boolean
      }
      catalog_issue_contains_my_book: {
        Args: { _issue_id: string }
        Returns: boolean
      }
      catalog_issue_is_published: {
        Args: { _issue_id: string }
        Returns: boolean
      }
      current_user_email: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_book_author: { Args: { _book_id: string }; Returns: boolean }
      is_book_member: { Args: { _book_id: string }; Returns: boolean }
      is_catalog_admin: { Args: never; Returns: boolean }
      is_my_catalog_author: { Args: { _author_id: string }; Returns: boolean }
      owns_catalog_book: { Args: { _book_id: string }; Returns: boolean }
    }
    Enums: {
      ai_contribution: "none" | "some" | "significant"
      app_role: "admin" | "author" | "collaborator"
      catalog_book_status:
        | "submitted"
        | "under_review"
        | "added_to_database"
        | "removed"
      issue_status: "draft" | "published"
      post_status: "draft" | "published"
      target_audience:
        | "adult"
        | "new_adult"
        | "young_adult"
        | "middle_grade"
        | "picture_book"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      ai_contribution: ["none", "some", "significant"],
      app_role: ["admin", "author", "collaborator"],
      catalog_book_status: [
        "submitted",
        "under_review",
        "added_to_database",
        "removed",
      ],
      issue_status: ["draft", "published"],
      post_status: ["draft", "published"],
      target_audience: [
        "adult",
        "new_adult",
        "young_adult",
        "middle_grade",
        "picture_book",
      ],
    },
  },
} as const
