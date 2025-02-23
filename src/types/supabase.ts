export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          name: string
          image: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          image?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          images: string[]
          seller_id: string
          category_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          images?: string[]
          seller_id: string
          category_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          images?: string[]
          seller_id?: string
          category_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      sellers: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          rating: number | null
          image: string | null
          contact_phone: string | null
          contact_email: string | null
          telegram_username: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          rating?: number | null
          image?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          telegram_username?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          rating?: number | null
          image?: string | null
          contact_phone?: string | null
          contact_email?: string | null
          telegram_username?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}