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
      candidate_accomplishments: {
        Row: {
          candidate_id: string
          created_at: string
          credential_url: string | null
          description: string | null
          expiry_date: string | null
          id: string
          issue_date: string | null
          issuing_org: string | null
          title: string
          type: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_org?: string | null
          title: string
          type: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          credential_url?: string | null
          description?: string | null
          expiry_date?: string | null
          id?: string
          issue_date?: string | null
          issuing_org?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_accomplishments_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_education: {
        Row: {
          candidate_id: string
          course: string | null
          course_type: string | null
          created_at: string
          degree_level: string
          grade_value: string | null
          grading_system: string | null
          id: string
          institution_city: string | null
          institution_pincode: string | null
          institution_state: string | null
          is_highest: boolean | null
          passing_year: number | null
          specialization: string | null
          starting_year: number | null
          university: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          course?: string | null
          course_type?: string | null
          created_at?: string
          degree_level: string
          grade_value?: string | null
          grading_system?: string | null
          id?: string
          institution_city?: string | null
          institution_pincode?: string | null
          institution_state?: string | null
          is_highest?: boolean | null
          passing_year?: number | null
          specialization?: string | null
          starting_year?: number | null
          university?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          course?: string | null
          course_type?: string | null
          created_at?: string
          degree_level?: string
          grade_value?: string | null
          grading_system?: string | null
          id?: string
          institution_city?: string | null
          institution_pincode?: string | null
          institution_state?: string | null
          is_highest?: boolean | null
          passing_year?: number | null
          specialization?: string | null
          starting_year?: number | null
          university?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_education_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_employment: {
        Row: {
          achievements: string | null
          candidate_id: string
          company_name: string
          created_at: string
          current_salary: number | null
          department: string | null
          description: string | null
          designation: string
          end_date: string | null
          id: string
          is_current: boolean | null
          notice_period: string | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          achievements?: string | null
          candidate_id: string
          company_name: string
          created_at?: string
          current_salary?: number | null
          department?: string | null
          description?: string | null
          designation: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          notice_period?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          achievements?: string | null
          candidate_id?: string
          company_name?: string
          created_at?: string
          current_salary?: number | null
          department?: string | null
          description?: string | null
          designation?: string
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          notice_period?: string | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_employment_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_exams: {
        Row: {
          candidate_id: string
          created_at: string
          exam_name: string
          id: string
          rank: string | null
          score: string | null
          year: number | null
        }
        Insert: {
          candidate_id: string
          created_at?: string
          exam_name: string
          id?: string
          rank?: string | null
          score?: string | null
          year?: number | null
        }
        Update: {
          candidate_id?: string
          created_at?: string
          exam_name?: string
          id?: string
          rank?: string | null
          score?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_exams_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_internships: {
        Row: {
          candidate_id: string
          company_name: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          role: string
          skills_learned: string[] | null
          start_date: string | null
          updated_at: string
        }
        Insert: {
          candidate_id: string
          company_name: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          role: string
          skills_learned?: string[] | null
          start_date?: string | null
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          company_name?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          role?: string
          skills_learned?: string[] | null
          start_date?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_internships_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_languages: {
        Row: {
          can_read: boolean | null
          can_speak: boolean | null
          can_write: boolean | null
          candidate_id: string
          created_at: string
          id: string
          language: string
          proficiency: string | null
        }
        Insert: {
          can_read?: boolean | null
          can_speak?: boolean | null
          can_write?: boolean | null
          candidate_id: string
          created_at?: string
          id?: string
          language: string
          proficiency?: string | null
        }
        Update: {
          can_read?: boolean | null
          can_speak?: boolean | null
          can_write?: boolean | null
          candidate_id?: string
          created_at?: string
          id?: string
          language?: string
          proficiency?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "candidate_languages_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      candidate_profiles: {
        Row: {
          about: string | null
          availability: string | null
          created_at: string
          date_of_birth: string | null
          education_level: Database["public"]["Enums"]["education_level"] | null
          expected_salary_max: number | null
          expected_salary_min: number | null
          experience_years: number | null
          full_name: string | null
          gender: string | null
          headline: string | null
          id: string
          location: string | null
          mobile_number: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          preferred_job_type: string[] | null
          preferred_locations: string[] | null
          profile_photo_url: string | null
          profile_summary: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          work_status: string | null
        }
        Insert: {
          about?: string | null
          availability?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          mobile_number?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_job_type?: string[] | null
          preferred_locations?: string[] | null
          profile_photo_url?: string | null
          profile_summary?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          work_status?: string | null
        }
        Update: {
          about?: string | null
          availability?: string | null
          created_at?: string
          date_of_birth?: string | null
          education_level?:
            | Database["public"]["Enums"]["education_level"]
            | null
          expected_salary_max?: number | null
          expected_salary_min?: number | null
          experience_years?: number | null
          full_name?: string | null
          gender?: string | null
          headline?: string | null
          id?: string
          location?: string | null
          mobile_number?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          preferred_job_type?: string[] | null
          preferred_locations?: string[] | null
          profile_photo_url?: string | null
          profile_summary?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          work_status?: string | null
        }
        Relationships: []
      }
      candidate_projects: {
        Row: {
          candidate_id: string
          created_at: string
          description: string | null
          end_date: string | null
          github_url: string | null
          id: string
          live_url: string | null
          skills_used: string[] | null
          start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          candidate_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          skills_used?: string[] | null
          start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          candidate_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          github_url?: string | null
          id?: string
          live_url?: string | null
          skills_used?: string[] | null
          start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "candidate_projects_candidate_id_fkey"
            columns: ["candidate_id"]
            isOneToOne: false
            referencedRelation: "candidate_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          body_preview: string | null
          created_at: string
          id: string
          job_id: string | null
          recipients: Json | null
          recruiter_id: string
          sent_to_count: number
          subject: string
          template_id: string | null
        }
        Insert: {
          body_preview?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          recipients?: Json | null
          recruiter_id: string
          sent_to_count?: number
          subject: string
          template_id?: string | null
        }
        Update: {
          body_preview?: string | null
          created_at?: string
          id?: string
          job_id?: string | null
          recipients?: Json | null
          recruiter_id?: string
          sent_to_count?: number
          subject?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "email_logs_recruiter_id_fkey"
            columns: ["recruiter_id"]
            isOneToOne: false
            referencedRelation: "recruiter_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      email_otps: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          otp_code: string
          used: boolean | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          otp_code: string
          used?: boolean | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          otp_code?: string
          used?: boolean | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_deadline: string | null
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
          job_visibility: string | null
          location: string
          num_positions: number | null
          recruiter_id: string
          role_category: string | null
          salary_max: number | null
          salary_min: number | null
          screening_questions: Json | null
          skills_required: string[] | null
          title: string
          updated_at: string
          work_mode: string | null
        }
        Insert: {
          application_deadline?: string | null
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
          job_visibility?: string | null
          location: string
          num_positions?: number | null
          recruiter_id: string
          role_category?: string | null
          salary_max?: number | null
          salary_min?: number | null
          screening_questions?: Json | null
          skills_required?: string[] | null
          title: string
          updated_at?: string
          work_mode?: string | null
        }
        Update: {
          application_deadline?: string | null
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
          job_visibility?: string | null
          location?: string
          num_positions?: number | null
          recruiter_id?: string
          role_category?: string | null
          salary_max?: number | null
          salary_min?: number | null
          screening_questions?: Json | null
          skills_required?: string[] | null
          title?: string
          updated_at?: string
          work_mode?: string | null
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
          company_size: string | null
          company_website: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          id: string
          industry: string | null
          onboarding_completed: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          about?: string | null
          company_location?: string | null
          company_logo_url?: string | null
          company_name: string
          company_size?: string | null
          company_website?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          about?: string | null
          company_location?: string | null
          company_logo_url?: string | null
          company_name?: string
          company_size?: string | null
          company_website?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          id?: string
          industry?: string | null
          onboarding_completed?: boolean | null
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
      application_status:
        | "applied"
        | "shortlisted"
        | "rejected"
        | "hired"
        | "in_review"
        | "interview"
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
      application_status: [
        "applied",
        "shortlisted",
        "rejected",
        "hired",
        "in_review",
        "interview",
      ],
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
