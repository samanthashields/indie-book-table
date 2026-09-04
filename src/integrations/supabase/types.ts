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
          book_id: string
          created_at: string
          email: string
          id: string
          invited_at: string
          name: string | null
          role: string
          status: string
          user_id: string | null
        }
        Insert: {
          book_id: string
          created_at?: string
          email: string
          id?: string
          invited_at?: string
          name?: string | null
          role: string
          status?: string
          user_id?: string | null
        }
        Update: {
          book_id?: string
          created_at?: string
          email?: string
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
      templates: {
        Row: {
          archived: boolean
          audience: string | null
          created_at: string
          description: string | null
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_book_author: { Args: { _book_id: string }; Returns: boolean }
      is_book_member: { Args: { _book_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "author" | "collaborator"
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
      app_role: ["admin", "author", "collaborator"],
    },
  },
} as const
