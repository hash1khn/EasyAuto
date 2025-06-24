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
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_table: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_table?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bids: {
        Row: {
          condition: Database["public"]["Enums"]["quote_condition"]
          created_at: string
          id: string
          image_url: string | null
          notes: string | null
          part_id: string
          price: number
          shipped_at: string | null
          status: Database["public"]["Enums"]["bid_status"]
          updated_at: string
          vendor_id: string
          warranty: Database["public"]["Enums"]["quote_warranty"]
        }
        Insert: {
          condition?: Database["public"]["Enums"]["quote_condition"]
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          part_id: string
          price: number
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
          vendor_id: string
          warranty?: Database["public"]["Enums"]["quote_warranty"]
        }
        Update: {
          condition?: Database["public"]["Enums"]["quote_condition"]
          created_at?: string
          id?: string
          image_url?: string | null
          notes?: string | null
          part_id?: string
          price?: number
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["bid_status"]
          updated_at?: string
          vendor_id?: string
          warranty?: Database["public"]["Enums"]["quote_warranty"]
        }
        Relationships: [
          {
            foreignKeyName: "bids_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bids_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_options: {
        Row: {
          created_at: string
          estimated_days: number
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          estimated_days: number
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          estimated_days?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      invoice_parts: {
        Row: {
          invoice_id: string
          part_id: string
          quantity: number
          unit_price: number
        }
        Insert: {
          invoice_id: string
          part_id: string
          quantity?: number
          unit_price: number
        }
        Update: {
          invoice_id?: string
          part_id?: string
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_parts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_parts_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          delivery_address: string | null
          delivery_fee: number
          delivery_note: string | null
          delivery_option_id: string | null
          driver_name: string | null
          id: string
          image_urls: string[] | null
          invoice_url: string | null
          paid_at: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          refund_status: Database["public"]["Enums"]["invoice_refund_status"]
          service_fee: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total_amount: number
          user_id: string
          vat_amount: number
        }
        Insert: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_note?: string | null
          delivery_option_id?: string | null
          driver_name?: string | null
          id?: string
          image_urls?: string[] | null
          invoice_url?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          refund_status?: Database["public"]["Enums"]["invoice_refund_status"]
          service_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total_amount: number
          user_id: string
          vat_amount?: number
        }
        Update: {
          created_at?: string
          delivery_address?: string | null
          delivery_fee?: number
          delivery_note?: string | null
          delivery_option_id?: string | null
          driver_name?: string | null
          id?: string
          image_urls?: string[] | null
          invoice_url?: string | null
          paid_at?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          refund_status?: Database["public"]["Enums"]["invoice_refund_status"]
          service_fee?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total_amount?: number
          user_id?: string
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_delivery_option_id_fkey"
            columns: ["delivery_option_id"]
            isOneToOne: false
            referencedRelation: "delivery_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          id: string
          is_paid: boolean
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_paid?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_paid?: boolean
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      part_activity_logs: {
        Row: {
          created_at: string
          id: string
          note: string | null
          part_id: string
          status: string
          updated_by: string
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          part_id: string
          status: string
          updated_by: string
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          part_id?: string
          status?: string
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "part_activity_logs_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
        ]
      }
      parts: {
        Row: {
          admin_collected_at: string | null
          admin_collected_by: string | null
          collected_at: string | null
          created_at: string
          delivered_at: string | null
          delivery_photo_url: string | null
          description: string | null
          estimated_budget: number | null
          expected_delivery_date: string | null
          id: string
          is_accepted: boolean | null
          order_id: string | null
          part_name: string
          part_number: string | null
          photos: string[] | null
          quantity: number
          shipped_at: string | null
          shipping_status: string | null
          vehicle_id: string
        }
        Insert: {
          admin_collected_at?: string | null
          admin_collected_by?: string | null
          collected_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_photo_url?: string | null
          description?: string | null
          estimated_budget?: number | null
          expected_delivery_date?: string | null
          id?: string
          is_accepted?: boolean | null
          order_id?: string | null
          part_name: string
          part_number?: string | null
          photos?: string[] | null
          quantity?: number
          shipped_at?: string | null
          shipping_status?: string | null
          vehicle_id: string
        }
        Update: {
          admin_collected_at?: string | null
          admin_collected_by?: string | null
          collected_at?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_photo_url?: string | null
          description?: string | null
          estimated_budget?: number | null
          expected_delivery_date?: string | null
          id?: string
          is_accepted?: boolean | null
          order_id?: string | null
          part_name?: string
          part_number?: string | null
          photos?: string[] | null
          quantity?: number
          shipped_at?: string | null
          shipping_status?: string | null
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "parts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "parts_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      refund_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          images: string[] | null
          invoice_id: string | null
          order_id: string
          part_id: string | null
          reason: string
          status: Database["public"]["Enums"]["refund_status"]
          updated_at: string
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          invoice_id?: string | null
          order_id: string
          part_id?: string | null
          reason: string
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          images?: string[] | null
          invoice_id?: string | null
          order_id?: string
          part_id?: string | null
          reason?: string
          status?: Database["public"]["Enums"]["refund_status"]
          updated_at?: string
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refund_requests_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_part_id_fkey"
            columns: ["part_id"]
            isOneToOne: false
            referencedRelation: "parts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refund_requests_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          duration_months: number
          features: Json | null
          id: string
          is_active: boolean
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          duration_months: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name: string
          price: number
        }
        Update: {
          created_at?: string
          duration_months?: number
          features?: Json | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
        }
        Relationships: []
      }
      user_delivery_addresses: {
        Row: {
          address: string
          created_at: string
          google_maps_url: string | null
          id: string
          instructions: string | null
          is_default: boolean
          name: string
          phone: string
          user_id: string
        }
        Insert: {
          address: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean
          name: string
          phone: string
          user_id: string
        }
        Update: {
          address?: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean
          name?: string
          phone?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          application_status: string | null
          application_submitted_at: string | null
          bank_iban: string | null
          bank_name: string | null
          business_name: string | null
          created_at: string
          default_payment_method: Database["public"]["Enums"]["payment_method"]
          delivery_address: string | null
          delivery_instructions: string | null
          delivery_phone: string | null
          email_notifications: boolean
          full_name: string
          google_maps_url: string | null
          id: string
          location: string
          rejection_reason: string | null
          sms_notifications: boolean
          updated_at: string
          user_id: string | null
          vendor_tags: string[] | null
          whatsapp_notifications: boolean
          whatsapp_number: string
        }
        Insert: {
          application_status?: string | null
          application_submitted_at?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          default_payment_method?: Database["public"]["Enums"]["payment_method"]
          delivery_address?: string | null
          delivery_instructions?: string | null
          delivery_phone?: string | null
          email_notifications?: boolean
          full_name: string
          google_maps_url?: string | null
          id: string
          location: string
          rejection_reason?: string | null
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string | null
          vendor_tags?: string[] | null
          whatsapp_notifications?: boolean
          whatsapp_number: string
        }
        Update: {
          application_status?: string | null
          application_submitted_at?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          business_name?: string | null
          created_at?: string
          default_payment_method?: Database["public"]["Enums"]["payment_method"]
          delivery_address?: string | null
          delivery_instructions?: string | null
          delivery_phone?: string | null
          email_notifications?: boolean
          full_name?: string
          google_maps_url?: string | null
          id?: string
          location?: string
          rejection_reason?: string | null
          sms_notifications?: boolean
          updated_at?: string
          user_id?: string | null
          vendor_tags?: string[] | null
          whatsapp_notifications?: boolean
          whatsapp_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          is_approved: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_subscriptions: {
        Row: {
          created_at: string
          end_date: string
          id: string
          is_active: boolean
          plan_id: string
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date: string
          id?: string
          is_active?: boolean
          plan_id: string
          start_date?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string
          id?: string
          is_active?: boolean
          plan_id?: string
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          make: string
          model: string
          user_id: string
          vin: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          make: string
          model: string
          user_id: string
          vin?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          make?: string
          model?: string
          user_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payouts: {
        Row: {
          amount: number
          amount_due_aed: number
          bid_id: string | null
          created_at: string
          id: string
          invoice_id: string | null
          order_id: string | null
          processed_at: string | null
          status: string
          transaction_id: string | null
          vendor_id: string
        }
        Insert: {
          amount: number
          amount_due_aed?: number
          bid_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          vendor_id: string
        }
        Update: {
          amount?: number
          amount_due_aed?: number
          bid_id?: string | null
          created_at?: string
          id?: string
          invoice_id?: string | null
          order_id?: string | null
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_payouts_bid_id_fkey"
            columns: ["bid_id"]
            isOneToOne: false
            referencedRelation: "bids"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payouts_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_payouts_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_pickup_addresses: {
        Row: {
          address: string
          created_at: string
          google_maps_url: string | null
          id: string
          instructions: string | null
          is_default: boolean
          name: string
          phone: string
          vendor_id: string
        }
        Insert: {
          address: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean
          name: string
          phone: string
          vendor_id: string
        }
        Update: {
          address?: string
          created_at?: string
          google_maps_url?: string | null
          id?: string
          instructions?: string | null
          is_default?: boolean
          name?: string
          phone?: string
          vendor_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_bid_and_update_part: {
        Args: { bid_id: string; part_id: string }
        Returns: undefined
      }
      collect_parts: {
        Args: { p_part_ids: string[]; p_driver_id: string }
        Returns: undefined
      }
      create_pickup_note_for_driver: {
        Args: { p_driver_id: string; p_vendor_id: string; p_notes?: string }
        Returns: string
      }
      delete_user_admin: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      get_admin_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          platform_stats: Json
          all_orders: Json
          all_users: Json
          vendor_applications: Json
        }[]
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_driver_logistics_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_live_orders: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_parts_with_pending_bids_for_user: {
        Args: { user_id_param: string }
        Returns: {
          id: string
          name: string
          vehicle: string
          order_id: string
          pending_bids_count: number
        }[]
      }
      get_user_orders: {
        Args: { p_user_id: string }
        Returns: Json
      }
      get_user_roles: {
        Args: { check_user_id: string }
        Returns: {
          role: Database["public"]["Enums"]["user_role"]
        }[]
      }
      get_vehicle_for_open_order_part: {
        Args: { part_id_param: string }
        Returns: {
          id: string
          make: string
          model: string
          year: number
          vin: string
        }[]
      }
      has_user_role: {
        Args: {
          check_user_id: string
          check_role: Database["public"]["Enums"]["user_role"]
        }
        Returns: boolean
      }
      has_vendor_access: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_vendor: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      update_individual_part_collection_status: {
        Args: {
          p_part_id: string
          p_driver_id: string
          p_pickup_notes_id: string
        }
        Returns: undefined
      }
      update_individual_part_delivery_status: {
        Args: {
          p_part_id: string
          p_driver_id: string
          p_delivery_notes_id: string
        }
        Returns: undefined
      }
      update_part_collection_status: {
        Args: {
          p_part_ids: string[]
          p_driver_id: string
          p_pickup_notes_id: string
        }
        Returns: undefined
      }
      update_part_shipping_status: {
        Args:
          | { part_id_arg: string; new_status: string }
          | { part_id_arg: string; new_status: string; updater_id_arg: string }
        Returns: undefined
      }
      update_user_roles: {
        Args: { p_user_id: string; p_roles: string[] }
        Returns: undefined
      }
    }
    Enums: {
      bid_status: "pending" | "accepted" | "rejected"
      driver_role: "delivery_driver"
      invoice_refund_status: "none" | "requested" | "approved" | "processed"
      order_status:
        | "open"
        | "partial"
        | "closed"
        | "cancelled"
        | "refunded"
        | "ready_for_checkout"
        | "completed"
      payment_method: "cod" | "card" | "bank_transfer"
      payment_status: "unpaid" | "paid" | "failed"
      quote_condition:
        | "New"
        | "Used - Excellent"
        | "Used - Good"
        | "Used - Fair"
      quote_warranty:
        | "No Warranty"
        | "3 Days"
        | "7 Days"
        | "14 Days"
        | "30 Days"
      refund_status: "pending" | "approved" | "rejected" | "processed"
      role_type: "buyer" | "vendor" | "admin"
      user_role: "buyer" | "vendor" | "admin" | "driver" | "sourcer"
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
    Enums: {
      bid_status: ["pending", "accepted", "rejected"],
      driver_role: ["delivery_driver"],
      invoice_refund_status: ["none", "requested", "approved", "processed"],
      order_status: [
        "open",
        "partial",
        "closed",
        "cancelled",
        "refunded",
        "ready_for_checkout",
        "completed",
      ],
      payment_method: ["cod", "card", "bank_transfer"],
      payment_status: ["unpaid", "paid", "failed"],
      quote_condition: [
        "New",
        "Used - Excellent",
        "Used - Good",
        "Used - Fair",
      ],
      quote_warranty: ["No Warranty", "3 Days", "7 Days", "14 Days", "30 Days"],
      refund_status: ["pending", "approved", "rejected", "processed"],
      role_type: ["buyer", "vendor", "admin"],
      user_role: ["buyer", "vendor", "admin", "driver", "sourcer"],
    },
  },
} as const
