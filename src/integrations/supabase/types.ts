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
      access_requests: {
        Row: {
          created_at: string
          id: string
          kind: string
          payload: Json
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          payload?: Json
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          payload?: Json
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      integrations: {
        Row: {
          events_count: number
          id: string
          kind: string
          last_sync: string
          name: string
          status: string
        }
        Insert: {
          events_count?: number
          id: string
          kind: string
          last_sync?: string
          name: string
          status: string
        }
        Update: {
          events_count?: number
          id?: string
          kind?: string
          last_sync?: string
          name?: string
          status?: string
        }
        Relationships: []
      }
      monitored_users: {
        Row: {
          active: boolean
          active_days: number
          avatar_seed: string
          avg_actions_per_day: number
          blocked: boolean
          created_at: string
          current_risk: number
          department: string
          email: string
          id: string
          name: string
          role: string
          usual_city: string
          usual_device: string
          usual_hour_end: number
          usual_hour_start: number
          usual_ip: string
        }
        Insert: {
          active?: boolean
          active_days?: number
          avatar_seed: string
          avg_actions_per_day?: number
          blocked?: boolean
          created_at?: string
          current_risk?: number
          department: string
          email: string
          id: string
          name: string
          role: string
          usual_city: string
          usual_device: string
          usual_hour_end: number
          usual_hour_start: number
          usual_ip: string
        }
        Update: {
          active?: boolean
          active_days?: number
          avatar_seed?: string
          avg_actions_per_day?: number
          blocked?: boolean
          created_at?: string
          current_risk?: number
          department?: string
          email?: string
          id?: string
          name?: string
          role?: string
          usual_city?: string
          usual_device?: string
          usual_hour_end?: number
          usual_hour_start?: number
          usual_ip?: string
        }
        Relationships: []
      }
      rules: {
        Row: {
          description: string
          enabled: boolean
          id: string
          name: string
          weight: number
        }
        Insert: {
          description: string
          enabled?: boolean
          id: string
          name: string
          weight: number
        }
        Update: {
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          weight?: number
        }
        Relationships: []
      }
      security_alerts: {
        Row: {
          created_at: string
          event_ids: Json
          id: string
          level: string
          reasons: Json
          score: number
          status: string
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_ids: Json
          id?: string
          level: string
          reasons: Json
          score: number
          status?: string
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_ids?: Json
          id?: string
          level?: string
          reasons?: Json
          score?: number
          status?: string
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          area: string | null
          city: string
          count: number | null
          device: string
          hour: number
          id: string
          ip: string
          metadata: Json | null
          ts: string
          type: string
          user_id: string
        }
        Insert: {
          area?: string | null
          city: string
          count?: number | null
          device: string
          hour: number
          id?: string
          ip: string
          metadata?: Json | null
          ts?: string
          type: string
          user_id: string
        }
        Update: {
          area?: string | null
          city?: string
          count?: number | null
          device?: string
          hour?: number
          id?: string
          ip?: string
          metadata?: Json | null
          ts?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
