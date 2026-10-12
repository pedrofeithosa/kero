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
      activity_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string
          details: Json
          id: string
          resource: string
          resource_id: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json
          id?: string
          resource: string
          resource_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string
          details?: Json
          id?: string
          resource?: string
          resource_id?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          archived_at: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          allowed_categories: string[]
          allowed_products: string[]
          code: string
          created_at: string
          description: string | null
          discount_type: Database["public"]["Enums"]["coupon_type"]
          discount_value: number
          ends_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          max_uses_per_customer: number | null
          min_order_total: number
          starts_at: string | null
          uses_count: number
        }
        Insert: {
          allowed_categories?: string[]
          allowed_products?: string[]
          code: string
          created_at?: string
          description?: string | null
          discount_type: Database["public"]["Enums"]["coupon_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_total?: number
          starts_at?: string | null
          uses_count?: number
        }
        Update: {
          allowed_categories?: string[]
          allowed_products?: string[]
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: Database["public"]["Enums"]["coupon_type"]
          discount_value?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          max_uses_per_customer?: number | null
          min_order_total?: number
          starts_at?: string | null
          uses_count?: number
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      delivery_addresses: {
        Row: {
          city: string
          complement: string | null
          created_at: string
          customer_id: string
          district: string
          id: string
          is_favorite: boolean
          label: string | null
          number: string
          reference: string | null
          state: string
          street: string
          updated_at: string
          zip: string
        }
        Insert: {
          city: string
          complement?: string | null
          created_at?: string
          customer_id: string
          district: string
          id?: string
          is_favorite?: boolean
          label?: string | null
          number: string
          reference?: string | null
          state: string
          street: string
          updated_at?: string
          zip: string
        }
        Update: {
          city?: string
          complement?: string | null
          created_at?: string
          customer_id?: string
          district?: string
          id?: string
          is_favorite?: boolean
          label?: string | null
          number?: string
          reference?: string | null
          state?: string
          street?: string
          updated_at?: string
          zip?: string
        }
        Relationships: [
          {
            foreignKeyName: "delivery_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      delivery_zones: {
        Row: {
          city: string
          created_at: string
          district: string
          eta_minutes: number
          fee: number
          free_from: number | null
          id: string
          is_active: boolean
          min_order_total: number
          state: string
        }
        Insert: {
          city?: string
          created_at?: string
          district: string
          eta_minutes?: number
          fee?: number
          free_from?: number | null
          id?: string
          is_active?: boolean
          min_order_total?: number
          state?: string
        }
        Update: {
          city?: string
          created_at?: string
          district?: string
          eta_minutes?: number
          fee?: number
          free_from?: number | null
          id?: string
          is_active?: boolean
          min_order_total?: number
          state?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          audience: Database["public"]["Enums"]["notification_audience"]
          created_at: string
          id: string
          order_id: string | null
          payload: Json
          read_at: string | null
          type: string
        }
        Insert: {
          audience: Database["public"]["Enums"]["notification_audience"]
          created_at?: string
          id?: string
          order_id?: string | null
          payload?: Json
          read_at?: string | null
          type: string
        }
        Update: {
          audience?: Database["public"]["Enums"]["notification_audience"]
          created_at?: string
          id?: string
          order_id?: string | null
          payload?: Json
          read_at?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          observations: string | null
          order_id: string
          product_id: string
          product_image: string | null
          product_name: string
          product_options: Json
          quantity: number
          total: number
          unit_price: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          order_id: string
          product_id: string
          product_image?: string | null
          product_name: string
          product_options?: Json
          quantity: number
          total: number
          unit_price: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          observations?: string | null
          order_id?: string
          product_id?: string
          product_image?: string | null
          product_name?: string
          product_options?: Json
          quantity?: number
          total?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_events: {
        Row: {
          created_at: string
          id: string
          note: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          order_id: string
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          order_id?: string
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address_id: string | null
          address_snapshot: Json | null
          cancel_note: string | null
          cancel_reason: string | null
          cancelled_at: string | null
          change_for: number | null
          coupon_code: string | null
          coupon_id: string | null
          created_at: string
          customer_id: string | null
          customer_snapshot: Json
          delivery_fee: number
          delivery_type: Database["public"]["Enums"]["delivery_type"]
          discount: number
          eta_minutes: number
          id: string
          notes: string | null
          number: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          scheduled_for: string | null
          status: Database["public"]["Enums"]["order_status"]
          subtotal: number
          total: number
          tracking_token: string
          updated_at: string
          user_id: string | null
          zone_id: string | null
        }
        Insert: {
          address_id?: string | null
          address_snapshot?: Json | null
          cancel_note?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          change_for?: number | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          delivery_fee?: number
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount?: number
          eta_minutes?: number
          id?: string
          notes?: string | null
          number?: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_token?: string
          updated_at?: string
          user_id?: string | null
          zone_id?: string | null
        }
        Update: {
          address_id?: string | null
          address_snapshot?: Json | null
          cancel_note?: string | null
          cancel_reason?: string | null
          cancelled_at?: string | null
          change_for?: number | null
          coupon_code?: string | null
          coupon_id?: string | null
          created_at?: string
          customer_id?: string | null
          customer_snapshot?: Json
          delivery_fee?: number
          delivery_type?: Database["public"]["Enums"]["delivery_type"]
          discount?: number
          eta_minutes?: number
          id?: string
          notes?: string | null
          number?: number
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          scheduled_for?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          subtotal?: number
          total?: number
          tracking_token?: string
          updated_at?: string
          user_id?: string | null
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "delivery_addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          paid_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          order_id: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          order_id?: string
          paid_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_groups: {
        Row: {
          created_at: string
          description: string | null
          id: string
          category_ids: string[]
          is_active: boolean
          is_shared: boolean
          max_select: number | null
          min_select: number
          name: string
          position: number
          product_id: string | null
          required: boolean
          type: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          category_ids?: string[]
          is_active?: boolean
          is_shared?: boolean
          max_select?: number | null
          min_select?: number
          name: string
          position?: number
          product_id?: string | null
          required?: boolean
          type?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          category_ids?: string[]
          is_active?: boolean
          is_shared?: boolean
          max_select?: number | null
          min_select?: number
          name?: string
          position?: number
          product_id?: string | null
          required?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_groups_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          group_id: string
          id: string
          is_active: boolean
          name: string
          position: number
          price_delta: number
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          is_active?: boolean
          name: string
          position?: number
          price_delta?: number
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          is_active?: boolean
          name?: string
          position?: number
          price_delta?: number
        }
        Relationships: [
          {
            foreignKeyName: "product_options_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "product_option_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          availability: string
          category_id: string | null
          compare_at: number | null
          created_at: string
          description: string
          gallery: string[]
          id: string
          image_url: string | null
          ingredients: string[]
          is_active: boolean
          is_best_seller: boolean
          is_featured: boolean
          is_new: boolean
          name: string
          position: number
          prep_time_minutes: number
          price: number
          slug: string
          sold_count: number
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          availability?: string
          category_id?: string | null
          compare_at?: number | null
          created_at?: string
          description?: string
          gallery?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name: string
          position?: number
          prep_time_minutes?: number
          price?: number
          slug: string
          sold_count?: number
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          availability?: string
          category_id?: string | null
          compare_at?: number | null
          created_at?: string
          description?: string
          gallery?: string[]
          id?: string
          image_url?: string | null
          ingredients?: string[]
          is_active?: boolean
          is_best_seller?: boolean
          is_featured?: boolean
          is_new?: boolean
          name?: string
          position?: number
          prep_time_minutes?: number
          price?: number
          slug?: string
          sold_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      promotions: {
        Row: {
          category_id: string | null
          created_at: string
          description: string | null
          discount_percent: number | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          product_id: string | null
          promo_price: number | null
          starts_at: string | null
          title: string
          updated_at: string
          usage_limit: number | null
          uses_count: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          product_id?: string | null
          promo_price?: number | null
          starts_at?: string | null
          title: string
          updated_at?: string
          usage_limit?: number | null
          uses_count?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          description?: string | null
          discount_percent?: number | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          product_id?: string | null
          promo_price?: number | null
          starts_at?: string | null
          title?: string
          updated_at?: string
          usage_limit?: number | null
          uses_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "promotions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_active: boolean
          last_seen_at: string | null
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_active?: boolean
          last_seen_at?: string | null
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_active?: boolean
          last_seen_at?: string | null
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      store_hours: {
        Row: {
          closes_at: string
          id: string
          is_closed: boolean
          opens_at: string
          weekday: number
        }
        Insert: {
          closes_at?: string
          id?: string
          is_closed?: boolean
          opens_at?: string
          weekday: number
        }
        Update: {
          closes_at?: string
          id?: string
          is_closed?: boolean
          opens_at?: string
          weekday?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          avg_prep_minutes: number
          city: string | null
          company_name: string
          description: string | null
          district: string | null
          id: boolean
          instagram: string | null
          logo_url: string | null
          number: string | null
          order_message: string | null
          paused_message: string | null
          pay_card_on_delivery: boolean
          pay_cash: boolean
          pay_online: boolean
          pay_pix: boolean
          phone: string | null
          state: string | null
          store_state: string
          street: string | null
          updated_at: string
          whatsapp: string | null
          whatsapp_auto_message: string | null
          whatsapp_order_message: string | null
          whatsapp_support_message: string | null
          zip: string | null
        }
        Insert: {
          avg_prep_minutes?: number
          city?: string | null
          company_name?: string
          description?: string | null
          district?: string | null
          id?: boolean
          instagram?: string | null
          logo_url?: string | null
          number?: string | null
          order_message?: string | null
          paused_message?: string | null
          pay_card_on_delivery?: boolean
          pay_cash?: boolean
          pay_online?: boolean
          pay_pix?: boolean
          phone?: string | null
          state?: string | null
          store_state?: string
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_auto_message?: string | null
          whatsapp_order_message?: string | null
          whatsapp_support_message?: string | null
          zip?: string | null
        }
        Update: {
          avg_prep_minutes?: number
          city?: string | null
          company_name?: string
          description?: string | null
          district?: string | null
          id?: boolean
          instagram?: string | null
          logo_url?: string | null
          number?: string | null
          order_message?: string | null
          paused_message?: string | null
          pay_card_on_delivery?: boolean
          pay_cash?: boolean
          pay_online?: boolean
          pay_pix?: boolean
          phone?: string | null
          state?: string | null
          store_state?: string
          street?: string | null
          updated_at?: string
          whatsapp?: string | null
          whatsapp_auto_message?: string | null
          whatsapp_order_message?: string | null
          whatsapp_support_message?: string | null
          zip?: string | null
        }
        Relationships: []
      }
      store_special_dates: {
        Row: {
          closes_at: string | null
          date: string
          id: string
          is_closed: boolean
          label: string | null
          opens_at: string | null
        }
        Insert: {
          closes_at?: string | null
          date: string
          id?: string
          is_closed?: boolean
          label?: string | null
          opens_at?: string | null
        }
        Update: {
          closes_at?: string | null
          date?: string
          id?: string
          is_closed?: boolean
          label?: string | null
          opens_at?: string | null
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
      admin_customers: {
        Args: { _limit?: number; _offset?: number; _search?: string }
        Returns: Json
      }
      admin_metrics: { Args: { _from: string; _to: string }; Returns: Json }
      admin_update_order_status: {
        Args: {
          _note?: string
          _order_id: string
          _reason?: string
          _status: Database["public"]["Enums"]["order_status"]
        }
        Returns: undefined
      }
      check_delivery_area: {
        Args: { _city?: string; _district: string }
        Returns: Json
      }
      create_order: { Args: { payload: Json }; Returns: Json }
      get_order_by_token: { Args: { _token: string }; Returns: Json }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_manager: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      log_activity: {
        Args: {
          _action: string
          _details?: Json
          _resource: string
          _resource_id?: string
        }
        Returns: undefined
      }
      store_status: { Args: { _at?: string }; Returns: Json }
      validate_coupon: {
        Args: {
          _category_ids?: string[]
          _code: string
          _delivery_fee?: number
          _product_ids?: string[]
          _subtotal: number
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "kitchen" | "customer" | "manager" | "attendant"
      coupon_type: "percent" | "fixed" | "free_shipping"
      delivery_type: "delivery" | "pickup"
      notification_audience: "customer" | "admin"
      order_status:
        | "received"
        | "accepted"
        | "preparing"
        | "ready"
        | "out_for_delivery"
        | "delivered"
        | "cancelled"
      payment_method: "pix" | "card_on_delivery" | "cash" | "online_card"
      payment_status: "pending" | "paid" | "failed" | "refunded"
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
      app_role: ["admin", "kitchen", "customer", "manager", "attendant"],
      coupon_type: ["percent", "fixed", "free_shipping"],
      delivery_type: ["delivery", "pickup"],
      notification_audience: ["customer", "admin"],
      order_status: [
        "received",
        "accepted",
        "preparing",
        "ready",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      payment_method: ["pix", "card_on_delivery", "cash", "online_card"],
      payment_status: ["pending", "paid", "failed", "refunded"],
    },
  },
} as const
