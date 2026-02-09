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
      app_settings: {
        Row: {
          created_at: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      backup_schedules: {
        Row: {
          backup_scope: string
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          notify_on_complete: boolean
          notify_on_failure: boolean
          retention_days: number
          updated_at: string
        }
        Insert: {
          backup_scope?: string
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_on_complete?: boolean
          notify_on_failure?: boolean
          retention_days?: number
          updated_at?: string
        }
        Update: {
          backup_scope?: string
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_on_complete?: boolean
          notify_on_failure?: boolean
          retention_days?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_categories: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          is_active: boolean
          name: string
          name_ar: string
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean
          name: string
          name_ar: string
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      blog_comments: {
        Row: {
          blog_post_id: string
          content: string
          created_at: string
          id: string
          is_approved: boolean
          is_rejected: boolean
          parent_comment_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          blog_post_id: string
          content: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_rejected?: boolean
          parent_comment_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          blog_post_id?: string
          content?: string
          created_at?: string
          id?: string
          is_approved?: boolean
          is_rejected?: boolean
          parent_comment_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_comments_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "blog_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_pages: {
        Row: {
          content: string | null
          content_ar: string | null
          created_at: string
          id: string
          is_published: boolean
          meta_description: string | null
          meta_description_ar: string | null
          meta_title: string | null
          meta_title_ar: string | null
          slug: string
          sort_order: number | null
          title: string
          title_ar: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          content_ar?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_description_ar?: string | null
          meta_title?: string | null
          meta_title_ar?: string | null
          slug: string
          sort_order?: number | null
          title: string
          title_ar: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          content_ar?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_description_ar?: string | null
          meta_title?: string | null
          meta_title_ar?: string | null
          slug?: string
          sort_order?: number | null
          title?: string
          title_ar?: string
          updated_at?: string
        }
        Relationships: []
      }
      blog_post_views: {
        Row: {
          blog_post_id: string
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
          user_id: string | null
          viewer_ip: string | null
        }
        Insert: {
          blog_post_id: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewer_ip?: string | null
        }
        Update: {
          blog_post_id?: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "blog_post_views_blog_post_id_fkey"
            columns: ["blog_post_id"]
            isOneToOne: false
            referencedRelation: "blog_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      blog_posts: {
        Row: {
          author_id: string | null
          author_name: string | null
          author_name_ar: string | null
          category: string | null
          category_ar: string | null
          content: string | null
          content_ar: string | null
          created_at: string
          excerpt: string | null
          excerpt_ar: string | null
          id: string
          image_url: string | null
          is_published: boolean | null
          published_at: string | null
          read_time: number | null
          slug: string
          title: string
          title_ar: string
          updated_at: string
          view_count: number
        }
        Insert: {
          author_id?: string | null
          author_name?: string | null
          author_name_ar?: string | null
          category?: string | null
          category_ar?: string | null
          content?: string | null
          content_ar?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_ar?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          title: string
          title_ar: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          author_id?: string | null
          author_name?: string | null
          author_name_ar?: string | null
          category?: string | null
          category_ar?: string | null
          content?: string | null
          content_ar?: string | null
          created_at?: string
          excerpt?: string | null
          excerpt_ar?: string | null
          id?: string
          image_url?: string | null
          is_published?: boolean | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          title?: string
          title_ar?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string
          parent_category_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar: string
          parent_category_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string
          parent_category_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_category_id_fkey"
            columns: ["parent_category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_loyalty_points: {
        Row: {
          created_at: string
          id: string
          points: number
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points?: number
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discount_codes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          description_ar: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          influencer_name: string | null
          influencer_name_ar: string | null
          is_active: boolean
          is_influencer: boolean
          max_discount_amount: number | null
          min_order_amount: number | null
          starts_at: string | null
          updated_at: string
          usage_count: number
          usage_limit: number | null
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          influencer_name?: string | null
          influencer_name_ar?: string | null
          is_active?: boolean
          is_influencer?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          influencer_name?: string | null
          influencer_name_ar?: string | null
          is_active?: boolean
          is_influencer?: boolean
          max_discount_amount?: number | null
          min_order_amount?: number | null
          starts_at?: string | null
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
        }
        Relationships: []
      }
      installed_plugins: {
        Row: {
          id: string
          installed_at: string
          is_active: boolean
          plugin_key: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          id?: string
          installed_at?: string
          is_active?: boolean
          plugin_key: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          id?: string
          installed_at?: string
          is_active?: boolean
          plugin_key?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      loyalty_points_history: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loyalty_points_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_settings: {
        Row: {
          created_at: string
          currency_per_point: number
          id: string
          is_active: boolean
          min_redeem_points: number
          points_per_currency: number
          updated_at: string
          welcome_bonus: number
        }
        Insert: {
          created_at?: string
          currency_per_point?: number
          id?: string
          is_active?: boolean
          min_redeem_points?: number
          points_per_currency?: number
          updated_at?: string
          welcome_bonus?: number
        }
        Update: {
          created_at?: string
          currency_per_point?: number
          id?: string
          is_active?: boolean
          min_redeem_points?: number
          points_per_currency?: number
          updated_at?: string
          welcome_bonus?: number
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          confirmation_token: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          is_confirmed: boolean
          subscribed_at: string
          unsubscribed_at: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          confirmation_token?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          is_confirmed?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          confirmation_token?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          is_confirmed?: boolean
          subscribed_at?: string
          unsubscribed_at?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          product_name: string
          product_name_ar: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          product_name: string
          product_name_ar?: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_name_ar?: string | null
          quantity?: number
          total_price?: number
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
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_tracking_events: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          location: string | null
          notes: string | null
          order_id: string
          status: string
          tracking_number: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          order_id: string
          status: string
          tracking_number?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          order_id?: string
          status?: string
          tracking_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_tracking_events_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_reference: string | null
          payment_status: string | null
          shipping_address: Json | null
          shipping_cost: number | null
          status: string | null
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_reference?: string | null
          payment_status?: string | null
          shipping_address?: Json | null
          shipping_cost?: number | null
          status?: string | null
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      page_seo_scores: {
        Row: {
          created_at: string
          details: Json | null
          has_alt_texts: boolean
          has_canonical: boolean
          has_h1: boolean
          has_meta_description: boolean
          has_meta_title: boolean
          has_og_tags: boolean
          has_structured_data: boolean
          heading_hierarchy_valid: boolean
          id: string
          missing_alt_count: number
          overall_score: number
          page_path: string
          page_title: string | null
          scanned_at: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          details?: Json | null
          has_alt_texts?: boolean
          has_canonical?: boolean
          has_h1?: boolean
          has_meta_description?: boolean
          has_meta_title?: boolean
          has_og_tags?: boolean
          has_structured_data?: boolean
          heading_hierarchy_valid?: boolean
          id?: string
          missing_alt_count?: number
          overall_score?: number
          page_path: string
          page_title?: string | null
          scanned_at?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          details?: Json | null
          has_alt_texts?: boolean
          has_canonical?: boolean
          has_h1?: boolean
          has_meta_description?: boolean
          has_meta_title?: boolean
          has_og_tags?: boolean
          has_structured_data?: boolean
          heading_hierarchy_valid?: boolean
          id?: string
          missing_alt_count?: number
          overall_score?: number
          page_path?: string
          page_title?: string | null
          scanned_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          error_message: string | null
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          metadata: Json | null
          order_id: string | null
          payment_method: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          error_message?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          metadata?: Json | null
          order_id?: string | null
          payment_method?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      product_offers: {
        Row: {
          created_at: string
          description: string | null
          description_ar: string | null
          discount_percentage: number | null
          expires_at: string | null
          group_price: number | null
          id: string
          is_active: boolean
          min_quantity: number | null
          name: string
          name_ar: string
          offer_type: string
          product_ids: string[]
          starts_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          group_price?: number | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          name: string
          name_ar: string
          offer_type: string
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_percentage?: number | null
          expires_at?: string | null
          group_price?: number | null
          id?: string
          is_active?: boolean
          min_quantity?: number | null
          name?: string
          name_ar?: string
          offer_type?: string
          product_ids?: string[]
          starts_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          order_id: string | null
          product_id: string
          rating: number
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          order_id?: string | null
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          barcode: string | null
          category_id: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          is_best_seller: boolean | null
          is_featured: boolean | null
          is_new_arrival: boolean | null
          name: string
          name_ar: string
          original_price: number | null
          price: number
          rating: number | null
          requires_prescription: boolean | null
          review_count: number | null
          slug: string
          stock_quantity: number | null
          updated_at: string
          vat_enabled: boolean
        }
        Insert: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          name: string
          name_ar: string
          original_price?: number | null
          price: number
          rating?: number | null
          requires_prescription?: boolean | null
          review_count?: number | null
          slug: string
          stock_quantity?: number | null
          updated_at?: string
          vat_enabled?: boolean
        }
        Update: {
          barcode?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          is_best_seller?: boolean | null
          is_featured?: boolean | null
          is_new_arrival?: boolean | null
          name?: string
          name_ar?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          requires_prescription?: boolean | null
          review_count?: number | null
          slug?: string
          stock_quantity?: number | null
          updated_at?: string
          vat_enabled?: boolean
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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_shipping_address: Json | null
          full_name: string | null
          full_name_ar: string | null
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_shipping_address?: Json | null
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_shipping_address?: Json | null
          full_name?: string | null
          full_name_ar?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          created_at: string
          estimated_days_max: number | null
          estimated_days_min: number | null
          free_shipping_threshold: number | null
          id: string
          is_active: boolean
          name: string
          name_ar: string
          regions: string[]
          shipping_rate: number
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          name: string
          name_ar: string
          regions?: string[]
          shipping_rate?: number
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          estimated_days_max?: number | null
          estimated_days_min?: number | null
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          name?: string
          name_ar?: string
          regions?: string[]
          shipping_rate?: number
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      site_backups: {
        Row: {
          backup_scope: string
          backup_type: string
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_size_bytes: number | null
          id: string
          notes: string | null
          started_at: string | null
          status: string
          tables_included: string[] | null
          triggered_by: string | null
        }
        Insert: {
          backup_scope?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
          triggered_by?: string | null
        }
        Update: {
          backup_scope?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_size_bytes?: number | null
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string
          tables_included?: string[] | null
          triggered_by?: string | null
        }
        Relationships: []
      }
      site_health_scans: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          issues_fixed: number
          issues_found: number
          overall_score: number
          results: Json
          scan_duration_ms: number | null
          scan_type: string
          status: string
          triggered_by: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          issues_fixed?: number
          issues_found?: number
          overall_score?: number
          results?: Json
          scan_duration_ms?: number | null
          scan_type?: string
          status?: string
          triggered_by?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          issues_fixed?: number
          issues_found?: number
          overall_score?: number
          results?: Json
          scan_duration_ms?: number | null
          scan_type?: string
          status?: string
          triggered_by?: string | null
        }
        Relationships: []
      }
      site_health_schedules: {
        Row: {
          check_categories: string[]
          created_at: string
          frequency: string
          id: string
          is_active: boolean
          last_run_at: string | null
          next_run_at: string | null
          notify_on_issues: boolean
          updated_at: string
        }
        Insert: {
          check_categories?: string[]
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_on_issues?: boolean
          updated_at?: string
        }
        Update: {
          check_categories?: string[]
          created_at?: string
          frequency?: string
          id?: string
          is_active?: boolean
          last_run_at?: string | null
          next_run_at?: string | null
          notify_on_issues?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      stock_history: {
        Row: {
          change_amount: number
          change_type: string
          changed_by: string | null
          created_at: string
          id: string
          new_quantity: number
          notes: string | null
          previous_quantity: number
          product_id: string
        }
        Insert: {
          change_amount: number
          change_type: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_quantity: number
          notes?: string | null
          previous_quantity: number
          product_id: string
        }
        Update: {
          change_amount?: number
          change_type?: string
          changed_by?: string | null
          created_at?: string
          id?: string
          new_quantity?: number
          notes?: string | null
          previous_quantity?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_licenses: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          expires_at: string | null
          id: string
          is_active: boolean
          license_key: string
          notes: string | null
          platform: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_key: string
          notes?: string | null
          platform: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean
          license_key?: string
          notes?: string | null
          platform?: string
          updated_at?: string
        }
        Relationships: []
      }
      theme_update_downloads: {
        Row: {
          downloaded_at: string
          id: string
          ip_address: string | null
          license_id: string
          platform: string
          version_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          license_id: string
          platform: string
          version_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          ip_address?: string | null
          license_id?: string
          platform?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "theme_update_downloads_license_id_fkey"
            columns: ["license_id"]
            isOneToOne: false
            referencedRelation: "theme_licenses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "theme_update_downloads_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "theme_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      theme_versions: {
        Row: {
          changelog: string | null
          changelog_ar: string | null
          created_at: string
          id: string
          is_published: boolean
          published_at: string | null
          salla_file_url: string | null
          shopify_file_url: string | null
          title: string
          title_ar: string
          updated_at: string
          version: string
          wordpress_file_url: string | null
        }
        Insert: {
          changelog?: string | null
          changelog_ar?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          salla_file_url?: string | null
          shopify_file_url?: string | null
          title: string
          title_ar?: string
          updated_at?: string
          version: string
          wordpress_file_url?: string | null
        }
        Update: {
          changelog?: string | null
          changelog_ar?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          published_at?: string | null
          salla_file_url?: string | null
          shopify_file_url?: string | null
          title?: string
          title_ar?: string
          updated_at?: string
          version?: string
          wordpress_file_url?: string | null
        }
        Relationships: []
      }
      trend_reports: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          language: string
          query: string | null
          result: Json
          summary: string | null
          triggered_by: string
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          language?: string
          query?: string | null
          result: Json
          summary?: string | null
          triggered_by?: string
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          language?: string
          query?: string | null
          result?: Json
          summary?: string | null
          triggered_by?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
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
      record_blog_view: {
        Args: {
          p_blog_post_id: string
          p_referrer?: string
          p_user_agent?: string
          p_user_id?: string
          p_viewer_ip?: string
        }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
