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
      bookings: {
        Row: {
          agency_notes: string | null
          budget_proposed: number | null
          created_at: string
          end_date: string
          final_price: number | null
          id: string
          location: string | null
          model_id: string
          professional_id: string
          project_description: string | null
          project_type: string | null
          start_date: string
          status: string | null
          updated_at: string
        }
        Insert: {
          agency_notes?: string | null
          budget_proposed?: number | null
          created_at?: string
          end_date: string
          final_price?: number | null
          id?: string
          location?: string | null
          model_id: string
          professional_id: string
          project_description?: string | null
          project_type?: string | null
          start_date: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          agency_notes?: string | null
          budget_proposed?: number | null
          created_at?: string
          end_date?: string
          final_price?: number | null
          id?: string
          location?: string | null
          model_id?: string
          professional_id?: string
          project_description?: string | null
          project_type?: string | null
          start_date?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professional_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          booking_id: string
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          sender_id: string
          sender_type: string
        }
        Insert: {
          booking_id: string
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id: string
          sender_type: string
        }
        Update: {
          booking_id?: string
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_id?: string
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      model_availability: {
        Row: {
          created_at: string
          date: string
          id: string
          is_available: boolean | null
          model_id: string
          notes: string | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          is_available?: boolean | null
          model_id: string
          notes?: string | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          is_available?: boolean | null
          model_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "model_availability_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          model_id: string
          type: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          model_id: string
          type?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          model_id?: string
          type?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "model_photos_model_id_fkey"
            columns: ["model_id"]
            isOneToOne: false
            referencedRelation: "model_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      model_profiles: {
        Row: {
          age: number | null
          bio: string | null
          budget_level: string | null
          bust: number | null
          categories: string[] | null
          cities_available: string[] | null
          created_at: string
          eye_color: string | null
          gender: string | null
          hair_color: string | null
          height: number | null
          hips: number | null
          id: string
          is_featured: boolean | null
          languages: string[] | null
          nationality: string | null
          price_per_day: number | null
          pseudo: string | null
          shoe_size: number | null
          status: string | null
          updated_at: string
          user_id: string
          verification_photo_url: string | null
          waist: number | null
          weight: number | null
        }
        Insert: {
          age?: number | null
          bio?: string | null
          budget_level?: string | null
          bust?: number | null
          categories?: string[] | null
          cities_available?: string[] | null
          created_at?: string
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          nationality?: string | null
          price_per_day?: number | null
          pseudo?: string | null
          shoe_size?: number | null
          status?: string | null
          updated_at?: string
          user_id: string
          verification_photo_url?: string | null
          waist?: number | null
          weight?: number | null
        }
        Update: {
          age?: number | null
          bio?: string | null
          budget_level?: string | null
          bust?: number | null
          categories?: string[] | null
          cities_available?: string[] | null
          created_at?: string
          eye_color?: string | null
          gender?: string | null
          hair_color?: string | null
          height?: number | null
          hips?: number | null
          id?: string
          is_featured?: boolean | null
          languages?: string[] | null
          nationality?: string | null
          price_per_day?: number | null
          pseudo?: string | null
          shoe_size?: number | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verification_photo_url?: string | null
          waist?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_booking_update: boolean | null
          email_marketing: boolean | null
          email_new_booking: boolean | null
          email_new_message: boolean | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_booking_update?: boolean | null
          email_marketing?: boolean | null
          email_new_booking?: boolean | null
          email_new_message?: boolean | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_booking_update?: boolean | null
          email_marketing?: boolean | null
          email_new_booking?: boolean | null
          email_new_message?: boolean | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      professional_favorites: {
        Row: {
          created_at: string
          id: string
          model_id: string
          professional_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model_id: string
          professional_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model_id?: string
          professional_id?: string
        }
        Relationships: []
      }
      professional_profiles: {
        Row: {
          company_name: string
          company_type: string | null
          created_at: string
          description: string | null
          id: string
          payment_method: string | null
          siret: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_status: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          company_name: string
          company_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          siret?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          company_name?: string
          company_type?: string | null
          created_at?: string
          description?: string | null
          id?: string
          payment_method?: string | null
          siret?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_status?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      app_role: "admin" | "moderator" | "model" | "professional"
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
      app_role: ["admin", "moderator", "model", "professional"],
    },
  },
} as const
