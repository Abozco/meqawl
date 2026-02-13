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
      companies: {
        Row: {
          address: string | null
          banned: boolean | null
          category: string | null
          city: string | null
          company_name: string
          created_at: string
          description: string | null
          email: string | null
          facebook_url: string | null
          founded_at: string | null
          id: string
          logo: string | null
          phone_1: string | null
          phone_2: string | null
          restricted: boolean | null
          slug: string | null
          user_id: string
          verified: boolean | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          banned?: boolean | null
          category?: string | null
          city?: string | null
          company_name: string
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          founded_at?: string | null
          id?: string
          logo?: string | null
          phone_1?: string | null
          phone_2?: string | null
          restricted?: boolean | null
          slug?: string | null
          user_id: string
          verified?: boolean | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          banned?: boolean | null
          category?: string | null
          city?: string | null
          company_name?: string
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          founded_at?: string | null
          id?: string
          logo?: string | null
          phone_1?: string | null
          phone_2?: string | null
          restricted?: boolean | null
          slug?: string | null
          user_id?: string
          verified?: boolean | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          company_id: string
          created_at: string
          id: string
          image_url: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          image_url: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          image_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "gallery_images_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          company_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          sender_type: Database["public"]["Enums"]["notification_sender"]
          title: string
        }
        Insert: {
          body: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type: Database["public"]["Enums"]["notification_sender"]
          title: string
        }
        Update: {
          body?: string
          company_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          sender_type?: Database["public"]["Enums"]["notification_sender"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          codes: string
          company_id: string
          created_at: string
          duration: Database["public"]["Enums"]["subscription_duration"]
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount: number
          codes: string
          company_id: string
          created_at?: string
          duration: Database["public"]["Enums"]["subscription_duration"]
          id?: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount?: number
          codes?: string
          company_id?: string
          created_at?: string
          duration?: Database["public"]["Enums"]["subscription_duration"]
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_offers: {
        Row: {
          bonus_months: number | null
          created_at: string | null
          duration: Database["public"]["Enums"]["subscription_duration"]
          id: string
          is_active: boolean | null
          offer_price: number | null
          offer_type: string
          original_price: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at: string | null
        }
        Insert: {
          bonus_months?: number | null
          created_at?: string | null
          duration: Database["public"]["Enums"]["subscription_duration"]
          id?: string
          is_active?: boolean | null
          offer_price?: number | null
          offer_type?: string
          original_price: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
        }
        Update: {
          bonus_months?: number | null
          created_at?: string | null
          duration?: Database["public"]["Enums"]["subscription_duration"]
          id?: string
          is_active?: boolean | null
          offer_price?: number | null
          offer_type?: string
          original_price?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          company_id: string
          created_at: string
          id: string
          image: string | null
          project_status: Database["public"]["Enums"]["project_status"]
          project_type: Database["public"]["Enums"]["project_type"]
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          image?: string | null
          project_status?: Database["public"]["Enums"]["project_status"]
          project_type: Database["public"]["Enums"]["project_type"]
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          image?: string | null
          project_status?: Database["public"]["Enums"]["project_status"]
          project_type?: Database["public"]["Enums"]["project_type"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          bonus_months: number | null
          code: string
          created_at: string
          discount_amount: number | null
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number
        }
        Insert: {
          bonus_months?: number | null
          code: string
          created_at?: string
          discount_amount?: number | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Update: {
          bonus_months?: number | null
          code?: string
          created_at?: string
          discount_amount?: number | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Relationships: []
      }
      services: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          price: number | null
          title: string
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          price?: number | null
          title: string
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          price?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      statistics: {
        Row: {
          company_id: string
          date: string
          facebook_clicks: number | null
          id: string
          phone_clicks: number | null
          visits: number | null
          whatsapp_clicks: number | null
        }
        Insert: {
          company_id: string
          date?: string
          facebook_clicks?: number | null
          id?: string
          phone_clicks?: number | null
          visits?: number | null
          whatsapp_clicks?: number | null
        }
        Update: {
          company_id?: string
          date?: string
          facebook_clicks?: number | null
          id?: string
          phone_clicks?: number | null
          visits?: number | null
          whatsapp_clicks?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "statistics_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          company_id: string
          created_at: string
          duration: Database["public"]["Enums"]["subscription_duration"]
          ends_at: string | null
          id: string
          plan: Database["public"]["Enums"]["subscription_plan"]
          price: number
          started_at: string | null
          status: Database["public"]["Enums"]["subscription_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          duration?: Database["public"]["Enums"]["subscription_duration"]
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          duration?: Database["public"]["Enums"]["subscription_duration"]
          ends_at?: string | null
          id?: string
          plan?: Database["public"]["Enums"]["subscription_plan"]
          price?: number
          started_at?: string | null
          status?: Database["public"]["Enums"]["subscription_status"]
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          company_id: string
          created_at: string
          id: string
          message: string
          reply: string | null
          status: Database["public"]["Enums"]["ticket_status"]
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          message: string
          reply?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          message?: string
          reply?: string | null
          status?: Database["public"]["Enums"]["ticket_status"]
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          company_id: string
          created_at: string
          id: string
          name: string
          photo: string | null
          position: string
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          name: string
          photo?: string | null
          position: string
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          name?: string
          photo?: string | null
          position?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      works: {
        Row: {
          company_id: string
          created_at: string
          description: string | null
          id: string
          image: string | null
          title: string
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Insert: {
          company_id: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          title: string
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Update: {
          company_id?: string
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          title?: string
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Relationships: [
          {
            foreignKeyName: "works_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_company_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "company"
      notification_sender: "support" | "admin" | "subscription"
      payment_status: "pending" | "confirmed" | "rejected"
      project_status: "قيد_التنفيذ" | "مكتمل"
      project_type: "سكني" | "تجاري" | "صناعي" | "بنية_تحتية"
      subscription_duration: "monthly" | "yearly"
      subscription_plan: "basic" | "premium" | "pro"
      subscription_status: "active" | "expired" | "cancelled" | "pending"
      ticket_status: "new" | "replied" | "closed"
      work_type: "تنفيذ" | "تشطيب" | "صيانة"
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
      app_role: ["admin", "company"],
      notification_sender: ["support", "admin", "subscription"],
      payment_status: ["pending", "confirmed", "rejected"],
      project_status: ["قيد_التنفيذ", "مكتمل"],
      project_type: ["سكني", "تجاري", "صناعي", "بنية_تحتية"],
      subscription_duration: ["monthly", "yearly"],
      subscription_plan: ["basic", "premium", "pro"],
      subscription_status: ["active", "expired", "cancelled", "pending"],
      ticket_status: ["new", "replied", "closed"],
      work_type: ["تنفيذ", "تشطيب", "صيانة"],
    },
  },
} as const
