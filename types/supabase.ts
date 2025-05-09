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
      users: {
        Row: {
          id: string
          email: string
          username: string
          created_at: string
          updated_at: string
          deleted_at: string | null
          last_modified_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
          last_modified_at?: string
        }
      }
    }
  }
}