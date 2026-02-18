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
      killer_courses: {
        Row: {
          id: string
          course_code: string
          course_name: string
          faculty: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_code: string
          course_name: string
          faculty?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          course_code?: string
          course_name?: string
          faculty?: string | null
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          association_id: string
          body: string | null
          click_count: number
          created_at: string | null
          created_by: string
          expires_at: string
          id: string
          link: string | null
          priority: string | null
          title: string
          view_count: number
        }
        Insert: {
          association_id: string
          body?: string | null
          click_count?: number
          created_at?: string | null
          created_by: string
          expires_at: string
          id?: string
          link?: string | null
          priority?: string | null
          title: string
          view_count?: number
        }
        Update: {
          association_id?: string
          body?: string | null
          click_count?: number
          created_at?: string | null
          created_by?: string
          expires_at?: string
          id?: string
          link?: string | null
          priority?: string | null
          title?: string
          view_count?: number
        }
        Relationships: []
      }
      study_jam_sessions: {
        Row: {
          id: string
          killer_course_id: string
          location: string
          scheduled_at: string
          max_participants: number
          current_count: number
          status: string
          notes: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          killer_course_id: string
          location: string
          scheduled_at: string
          max_participants?: number
          current_count?: number
          status?: string
          notes?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          killer_course_id?: string
          location?: string
          scheduled_at?: string
          max_participants?: number
          current_count?: number
          status?: string
          notes?: string | null
          created_by?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_jam_sessions_killer_course_id_fkey"
            columns: ["killer_course_id"]
            isOneToOne: false
            referencedRelation: "killer_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      spolky_accounts: {
        Row: {
          association_id: string
          association_name: string
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          role: string
        }
        Insert: {
          association_id: string
          association_name: string
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Update: {
          association_id?: string
          association_name?: string
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          role?: string
        }
        Relationships: []
      }
      tutorial_slides: {
        Row: {
          id: string
          layout: string
          left_image_url: string | null
          order: number
          tutorial_id: string
        }
        Insert: {
          id?: string
          layout: string
          left_image_url?: string | null
          order: number
          tutorial_id: string
        }
        Update: {
          id?: string
          layout?: string
          left_image_url?: string | null
          order?: number
          tutorial_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_slides_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          association_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          association_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          association_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_my_role: { Args: never; Returns: string }
      increment_notification_click: {
        Args: { row_id: string }
        Returns: undefined
      }
      increment_notification_view: {
        Args: { row_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
