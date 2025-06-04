export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      area_settings: {
        Row: {
          area_name: string
          capacity_usage: number
          height: number
          highlight: string | null
          id: number
          last_updated: string
          width: number
          x: number
          y: number
        }
        Insert: {
          area_name: string
          capacity_usage?: number
          height?: number
          highlight?: string | null
          id?: number
          last_updated?: string
          width?: number
          x?: number
          y?: number
        }
        Update: {
          area_name?: string
          capacity_usage?: number
          height?: number
          highlight?: string | null
          id?: number
          last_updated?: string
          width?: number
          x?: number
          y?: number
        }
        Relationships: []
      }
      thresholds: {
        Row: {
          color: string
          id: number
          setting_id: number
          upper_threshold: number
        }
        Insert: {
          color: string
          id?: number
          setting_id: number
          upper_threshold: number
        }
        Update: {
          color?: string
          id?: number
          setting_id?: number
          upper_threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "fk_setting"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "area_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_setting"
            columns: ["setting_id"]
            isOneToOne: false
            referencedRelation: "area_status"
            referencedColumns: ["area_number"]
          },
        ]
      }
      visitor_data: {
        Row: {
          amount_visitors: number
          area_id: number
          id: string
          timestamp: string
        }
        Insert: {
          amount_visitors?: number
          area_id: number
          id?: string
          timestamp?: string
        }
        Update: {
          amount_visitors?: number
          area_id?: number
          id?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_area_id"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_settings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_area_id"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "area_status"
            referencedColumns: ["area_number"]
          },
        ]
      }
    }
    Views: {
      area_status: {
        Row: {
          amount_visitors: number | null
          area_name: string | null
          area_number: number | null
          capacity_usage: number | null
          height: number | null
          highlight: string | null
          thresholds: Json | null
          width: number | null
          x: number | null
          y: number | null
        }
        Insert: {
          amount_visitors?: never
          area_name?: string | null
          area_number?: number | null
          capacity_usage?: number | null
          height?: number | null
          highlight?: string | null
          thresholds?: never
          width?: number | null
          x?: number | null
          y?: number | null
        }
        Update: {
          amount_visitors?: never
          area_name?: string | null
          area_number?: number | null
          capacity_usage?: number | null
          height?: number | null
          highlight?: string | null
          thresholds?: never
          width?: number | null
          x?: number | null
          y?: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      },
      update_area_settings: {
        Args: {area_id: number, setting_json: Json}
        Returns: null
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
