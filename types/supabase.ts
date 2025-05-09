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
      shopping_lists: {
        Row: {
          list_id: string
          name: string
          description: string | null
          created_by: string
          is_shared: boolean
          is_locked: boolean
          created_at: string
          updated_at: string
          deleted_at: string | null
          last_modified_at: string
        }
        Insert: {
          list_id?: string
          name: string
          description?: string | null
          created_by: string
          is_shared?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
        Update: {
          list_id?: string
          name?: string
          description?: string | null
          created_by?: string
          is_shared?: boolean
          is_locked?: boolean
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
      }
      list_items: {
        Row: {
          item_id: string
          list_id: string
          name: string
          quantity: number
          unit: string | null
          is_purchased: boolean
          purchased_by: string | null
          purchased_at: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
          last_modified_at: string
        }
        Insert: {
          item_id?: string
          list_id: string
          name: string
          quantity?: number
          unit?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
        Update: {
          item_id?: string
          list_id?: string
          name?: string
          quantity?: number
          unit?: string | null
          is_purchased?: boolean
          purchased_by?: string | null
          purchased_at?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
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