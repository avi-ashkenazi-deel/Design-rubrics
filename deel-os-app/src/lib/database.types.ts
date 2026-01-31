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
      profiles: {
        Row: {
          id: string
          email: string
          role: 'viewer' | 'editor' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'viewer' | 'editor' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'viewer' | 'editor' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      rubric_data: {
        Row: {
          id: number
          discipline: string
          level: string
          stage: string
          competency: string
          score_1: string | null
          score_2: string | null
          score_3: string | null
          score_4: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          discipline: string
          level: string
          stage: string
          competency: string
          score_1?: string | null
          score_2?: string | null
          score_3?: string | null
          score_4?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          discipline?: string
          level?: string
          stage?: string
          competency?: string
          score_1?: string | null
          score_2?: string | null
          score_3?: string | null
          score_4?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      change_history: {
        Row: {
          id: number
          rubric_id: number
          field: string
          old_value: string | null
          new_value: string | null
          changed_by: string
          changed_at: string
        }
        Insert: {
          id?: number
          rubric_id: number
          field: string
          old_value?: string | null
          new_value?: string | null
          changed_by: string
          changed_at?: string
        }
        Update: {
          id?: number
          rubric_id?: number
          field?: string
          old_value?: string | null
          new_value?: string | null
          changed_by?: string
          changed_at?: string
        }
      }
      competency_definitions: {
        Row: {
          id: number
          discipline: string
          competency: string
          definition: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          discipline: string
          competency: string
          definition?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          discipline?: string
          competency?: string
          definition?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: number
          discipline: string
          stage: string
          competency: string
          question: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          discipline: string
          stage: string
          competency: string
          question: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          discipline?: string
          stage?: string
          competency?: string
          question?: string
          created_at?: string
          updated_at?: string
        }
      }
      ladder_data: {
        Row: {
          id: number
          discipline: string
          level: string
          facet: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          discipline: string
          level: string
          facet: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          discipline?: string
          level?: string
          facet?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      competency_mappings: {
        Row: {
          id: number
          discipline: string
          hiring_competency: string
          ladder_facet: string
          relationship_type: 'direct' | 'partial' | 'hiring_only' | 'ladder_only'
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          discipline: string
          hiring_competency: string
          ladder_facet: string
          relationship_type?: 'direct' | 'partial' | 'hiring_only' | 'ladder_only'
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          discipline?: string
          hiring_competency?: string
          ladder_facet?: string
          relationship_type?: 'direct' | 'partial' | 'hiring_only' | 'ladder_only'
          notes?: string | null
          created_at?: string
          updated_at?: string
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
  }
}
