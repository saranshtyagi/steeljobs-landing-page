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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          candidate_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          candidate_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          about: string | null
          created_at: string
          education_level: Database["public"]["Enums"]["education_level"] | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          experience_years: number | null
          headline: string | null
          id: string
          location: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          created_at?: string
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          headline?: string | null
          id?: string
          location?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          created_at?: string
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          headline?: string | null
          id?: string
          location?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          body_preview: string | null
          created_at: string
          id: string
          recruiter_id: string
          sent_to_count: number
          subject: string
        }
        Insert: {
          body_preview?: string | null
          created_at?: string
          id?: string
          recruiter_id: string
          sent_to_count?: number
          subject: string
        }
        Update: {
          body_preview?: string | null
          created_at?: string
          id?: string
          recruiter_id?: string
          sent_to_count?: number
          subject?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          company_name: string
          created_at: string
          description: string
          education_required:
            | Database["public"]["Enums"]["education_level"]
            | null
          employment_type: Database["public"]["Enums"]["employment_type"]
          experience_max: number | null
          experience_min: number | null
          id: string
          is_active: boolean
          location: string
          recruiter_id: string
          salary_max: number | null
          salary_min: number | null
          skills_required: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description: string
          education_required?:
            | Database["public"]["Enums"]["education_level"]
            | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          is_active?: boolean
          location: string
          recruiter_id: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          education_required?:
            | Database["public"]["Enums"]["education_level"]
            | null
          employment_type?: Database["public"]["Enums"]["employment_type"]
          experience_max?: number | null
          experience_min?: number | null
          id?: string
          is_active?: boolean
          location?: string
          recruiter_id?: string
          salary_max?: number | null
          salary_min?: number | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recruiter_profiles: {
        Row: {
          about: string | null
          company_location: string | null
          company_logo_url: string | null
          company_name: string
          company_website: string | null
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          company_location?: string | null
          company_logo_url?: string | null
          company_name: string
          company_website?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          company_location?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_website?: string | null
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          candidate_id: string
          created_at: string
          id: string
          job_id: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          id?: string
          job_id: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          id?: string
          job_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "recruiter" | "candidate"
      application_status: "applied" | "shortlisted" | "rejected" | "hired"
      education_level:
        | "high_school"
        | "associate"
        | "bachelor"
        | "master"
        | "doctorate"
        | "other"
      employment_type:
        | "full_time"
        | "part_time"
        | "contract"
        | "internship"
        | "remote"
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
      app_role: ["recruiter", "candidate"],
      application_status: ["applied", "shortlisted", "rejected", "hired"],
      education_level: [
        "high_school",
        "associate",
        "bachelor",
        "master",
        "doctorate",
        "other",
      ],
      employment_type: [
        "full_time",
        "part_time",
        "contract",
        "internship",
        "remote",
      ],
    },
  },
} as const
