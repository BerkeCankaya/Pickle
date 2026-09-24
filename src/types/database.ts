// Supabase'den otomatik üretilen veritabanı tipleri (MCP generate_typescript_types).
// Tablolar değişince yeniden üretilmeli; elle düzenlenmemeli.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      likes: {
        Row: {
          created_at: string
          quiz_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          quiz_id: string
          user_id?: string
        }
        Update: {
          created_at?: string
          quiz_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      play_logs: {
        Row: {
          client_key: string
          created_at: string
          id: number
          quiz_id: string
        }
        Insert: {
          client_key: string
          created_at?: string
          id?: never
          quiz_id: string
        }
        Update: {
          client_key?: string
          created_at?: string
          id?: never
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "play_logs_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          is_banned: boolean
          role: Database["public"]["Enums"]["user_role"]
          terms_accepted_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          is_banned?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          terms_accepted_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          is_banned?: boolean
          role?: Database["public"]["Enums"]["user_role"]
          terms_accepted_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_daily_plays: {
        Row: {
          day: string
          plays: number
          quiz_id: string
        }
        Insert: {
          day?: string
          plays?: number
          quiz_id: string
        }
        Update: {
          day?: string
          plays?: number
          quiz_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_daily_plays_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          championships: number
          id: string
          losses: number
          media_type: Database["public"]["Enums"]["media_type"]
          media_url: string | null
          name: string
          quiz_id: string
          wins: number
        }
        Insert: {
          championships?: number
          id?: string
          losses?: number
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          name: string
          quiz_id: string
          wins?: number
        }
        Update: {
          championships?: number
          id?: string
          losses?: number
          media_type?: Database["public"]["Enums"]["media_type"]
          media_url?: string | null
          name?: string
          quiz_id?: string
          wins?: number
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          category: string
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string
          id: string
          like_count: number
          option_count: number
          play_count: number
          report_count: number
          status: Database["public"]["Enums"]["quiz_status"]
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          like_count?: number
          option_count?: number
          play_count?: number
          report_count?: number
          status?: Database["public"]["Enums"]["quiz_status"]
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string
          id?: string
          like_count?: number
          option_count?: number
          play_count?: number
          report_count?: number
          status?: Database["public"]["Enums"]["quiz_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          note: string | null
          quiz_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id: string
          status: Database["public"]["Enums"]["report_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          note?: string | null
          quiz_id: string
          reason: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Update: {
          created_at?: string
          id?: string
          note?: string | null
          quiz_id?: string
          reason?: Database["public"]["Enums"]["report_reason"]
          reporter_id?: string
          status?: Database["public"]["Enums"]["report_status"]
        }
        Relationships: [
          {
            foreignKeyName: "reports_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_reporter_id_fkey"
            columns: ["reporter_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_profile: { Args: { p_username: string }; Returns: undefined }
      create_quiz: {
        Args: {
          p_category: string
          p_cover_path: string | null
          p_description: string
          p_options: Json
          p_title: string
        }
        Returns: string
      }
      get_my_profile: {
        Args: never
        Returns: {
          avatar_url: string | null
          created_at: string
          id: string
          is_banned: boolean
          role: Database["public"]["Enums"]["user_role"]
          terms_accepted_at: string | null
          username: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "profiles"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      list_quizzes: {
        Args: {
          p_category?: string
          p_limit?: number
          p_query?: string
          p_tab: string
        }
        Returns: {
          category: string
          cover_url: string
          created_at: string
          creator_id: string
          creator_name: string
          description: string
          id: string
          like_count: number
          option_count: number
          play_count: number
          recent_play_count: number
          title: string
        }[]
      }
      record_play: {
        Args: {
          p_champion_id: string
          p_matches: Json
          p_quiz_id: string
          p_size: number
        }
        Returns: undefined
      }
    }
    Enums: {
      media_type: "image" | "gif"
      quiz_status: "published" | "hidden"
      report_reason: "inappropriate" | "copyright" | "spam" | "other"
      report_status: "open" | "resolved" | "rejected"
      user_role: "user" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
