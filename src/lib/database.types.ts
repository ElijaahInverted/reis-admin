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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      killer_courses: {
        Row: {
          course_code: string
          course_name: string
          created_at: string
          faculty: string | null
          id: string
          is_active: boolean
        }
        Insert: {
          course_code: string
          course_name: string
          created_at?: string
          faculty?: string | null
          id?: string
          is_active?: boolean
        }
        Update: {
          course_code?: string
          course_name?: string
          created_at?: string
          faculty?: string | null
          id?: string
          is_active?: boolean
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
          visible_from: string | null
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
          visible_from?: string | null
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
          visible_from?: string | null
        }
        Relationships: []
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
      study_jam_availability: {
        Row: {
          course_code: string
          created_at: string
          id: string
          role: string
          student_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          id?: string
          role: string
          student_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          id?: string
          role?: string
          student_id?: string
        }
        Relationships: []
      }
      study_jam_dismissals: {
        Row: {
          course_code: string
          created_at: string
          id: string
          student_id: string
        }
        Insert: {
          course_code: string
          created_at?: string
          id?: string
          student_id: string
        }
        Update: {
          course_code?: string
          created_at?: string
          id?: string
          student_id?: string
        }
        Relationships: []
      }
      tutoring_matches: {
        Row: {
          course_code: string
          id: string
          matched_at: string
          tutee_student_id: string
          tutor_student_id: string
        }
        Insert: {
          course_code: string
          id?: string
          matched_at?: string
          tutee_student_id: string
          tutor_student_id: string
        }
        Update: {
          course_code?: string
          id?: string
          matched_at?: string
          tutee_student_id?: string
          tutor_student_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_study_jam_availability: {
        Args: { p_course_code: string; p_student_id: string }
        Returns: undefined
      }
      dismiss_study_jam_suggestion: {
        Args: { p_course_code: string; p_student_id: string }
        Returns: undefined
      }
      get_my_role: { Args: never; Returns: string }
      increment_notification_click: {
        Args: { row_id: string }
        Returns: undefined
      }
      increment_notification_view: {
        Args: { row_id: string }
        Returns: undefined
      }
      match_study_jam: { Args: { p_course_code: string }; Returns: undefined }
      register_study_jam_availability: {
        Args: { p_course_code: string; p_role: string; p_student_id: string }
        Returns: undefined
      }
      withdraw_study_jam_match: {
        Args: { p_course_code: string; p_student_id: string }
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
