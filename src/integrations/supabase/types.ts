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
      application_tag_assignments: {
        Row: {
          application_id: string
          created_at: string
          id: string
          tag_id: string
        }
        Insert: {
          application_id: string
          created_at?: string
          id?: string
          tag_id: string
        }
        Update: {
          application_id?: string
          created_at?: string
          id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_tag_assignments_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "vendor_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "application_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vendor_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      deliveries: {
        Row: {
          collected_at: string | null
          created_at: string
          delivered_at: string | null
          driver_id: string | null
          id: string
          order_id: string
          pickup_address_id: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["shipping_status"]
          updated_at: string
        }
        Insert: {
          collected_at?: string | null
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          id?: string
          order_id: string
          pickup_address_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipping_status"]
          updated_at?: string
        }
        Update: {
          collected_at?: string | null
          created_at?: string
          delivered_at?: string | null
          driver_id?: string | null
          id?: string
          order_id?: string
          pickup_address_id?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["shipping_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deliveries_driver_id_fkey"
            columns: ["driver_id"]
            isOneToOne: false
            referencedRelation: "drivers"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "deliveries_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deliveries_pickup_address_id_fkey"
            columns: ["pickup_address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      drivers: {
        Row: {
          created_at: string
          license_number: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          license_number: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          license_number?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drivers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          created_at: string
          delivery_fee: number
          id: string
          order_id: string
          paid_at: string | null
          service_fee: number
          status: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          total_amount: number | null
          vat_amount: number
        }
        Insert: {
          created_at?: string
          delivery_fee?: number
          id?: string
          order_id: string
          paid_at?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal: number
          total_amount?: number | null
          vat_amount?: number
        }
        Update: {
          created_at?: string
          delivery_fee?: number
          id?: string
          order_id?: string
          paid_at?: string | null
          service_fee?: number
          status?: Database["public"]["Enums"]["payment_status"]
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          total_amount?: number | null
          vat_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          sent_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          whatsapp_sent: boolean | null
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
          whatsapp_sent?: boolean | null
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          sent_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
          whatsapp_sent?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          buyer_id: string
          created_at: string
          delivery_address_id: string | null
          id: string
          quote_id: string
          request_id: string
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          quote_id: string
          request_id: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          delivery_address_id?: string | null
          id?: string
          quote_id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_delivery_address_id_fkey"
            columns: ["delivery_address_id"]
            isOneToOne: false
            referencedRelation: "user_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "part_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      part_requests: {
        Row: {
          buyer_id: string
          created_at: string
          description: string | null
          id: string
          part_condition: Database["public"]["Enums"]["part_condition"]
          part_name: string
          quantity: number
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          vehicle_id: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          description?: string | null
          id?: string
          part_condition?: Database["public"]["Enums"]["part_condition"]
          part_name: string
          quantity?: number
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          vehicle_id: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          description?: string | null
          id?: string
          part_condition?: Database["public"]["Enums"]["part_condition"]
          part_name?: string
          quantity?: number
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          vehicle_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_vehicle_buyer"
            columns: ["vehicle_id", "buyer_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id", "user_id"]
          },
          {
            foreignKeyName: "part_requests_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          created_at: string
          estimated_days: number | null
          id: string
          notes: string | null
          price: number
          request_id: string
          status: Database["public"]["Enums"]["quote_status"]
          updated_at: string
          vendor_id: string
        }
        Insert: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          notes?: string | null
          price: number
          request_id: string
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          vendor_id: string
        }
        Update: {
          created_at?: string
          estimated_days?: number | null
          id?: string
          notes?: string | null
          price?: number
          request_id?: string
          status?: Database["public"]["Enums"]["quote_status"]
          updated_at?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quotes_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "part_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      user_addresses: {
        Row: {
          address: string
          created_at: string
          google_maps_url: string | null
          id: string
          instructions: string | null
          is_default: boolean
          name: string
          phone: string
          updated_at: string
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
          updated_at?: string
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
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          location: string | null
          phone: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          auth_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          location?: string | null
          phone: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          auth_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          location?: string | null
          phone?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          created_at: string
          id: string
          make: string
          model: string
          updated_at: string
          user_id: string
          vin: string | null
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          make: string
          model: string
          updated_at?: string
          user_id: string
          vin?: string | null
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          make?: string
          model?: string
          updated_at?: string
          user_id?: string
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_applications: {
        Row: {
          admin_notes: string | null
          business_description: string | null
          business_name: string
          created_at: string
          id: string
          location: string
          status: Database["public"]["Enums"]["vendor_application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          business_description?: string | null
          business_name: string
          created_at?: string
          id?: string
          location: string
          status?: Database["public"]["Enums"]["vendor_application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          business_description?: string | null
          business_name?: string
          created_at?: string
          id?: string
          location?: string
          status?: Database["public"]["Enums"]["vendor_application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_applications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_tag_assignments: {
        Row: {
          tag_id: string
          vendor_id: string
        }
        Insert: {
          tag_id: string
          vendor_id: string
        }
        Update: {
          tag_id?: string
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "vendor_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_tag_assignments_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["user_id"]
          },
        ]
      }
      vendor_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      vendors: {
        Row: {
          bank_iban: string | null
          bank_name: string | null
          business_name: string
          created_at: string
          referred_by: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bank_iban?: string | null
          bank_name?: string | null
          business_name: string
          created_at?: string
          referred_by?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bank_iban?: string | null
          bank_name?: string | null
          business_name?: string
          created_at?: string
          referred_by?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_status: "pending" | "sent" | "failed"
      notification_type:
        | "new_request"
        | "quote_accepted"
        | "payment_received"
        | "order_shipped"
      order_status:
        | "created"
        | "paid"
        | "preparing"
        | "ready_for_pickup"
        | "in_transit"
        | "delivered"
      part_condition: "new" | "used" | "new_or_used"
      payment_status: "unpaid" | "paid" | "failed" | "refunded"
      quote_status: "submitted" | "accepted" | "rejected"
      request_status: "open" | "quoted" | "accepted" | "fulfilled" | "cancelled"
      shipping_status:
        | "pending_pickup"
        | "collected"
        | "admin_collected"
        | "delivered"
      user_role: "buyer" | "vendor" | "admin" | "driver"
      vendor_application_status: "pending" | "approved" | "rejected"
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
      notification_status: ["pending", "sent", "failed"],
      notification_type: [
        "new_request",
        "quote_accepted",
        "payment_received",
        "order_shipped",
      ],
      order_status: [
        "created",
        "paid",
        "preparing",
        "ready_for_pickup",
        "in_transit",
        "delivered",
      ],
      part_condition: ["new", "used", "new_or_used"],
      payment_status: ["unpaid", "paid", "failed", "refunded"],
      quote_status: ["submitted", "accepted", "rejected"],
      request_status: ["open", "quoted", "accepted", "fulfilled", "cancelled"],
      shipping_status: [
        "pending_pickup",
        "collected",
        "admin_collected",
        "delivered",
      ],
      user_role: ["buyer", "vendor", "admin", "driver"],
      vendor_application_status: ["pending", "approved", "rejected"],
    },
  },
} as const
