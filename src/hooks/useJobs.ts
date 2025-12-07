import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type EmploymentType = "full_time" | "part_time" | "contract" | "internship" | "remote";
export type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";

export interface Job {
  id: string;
  recruiter_id: string;
  title: string;
  company_name: string;
  location: string;
  employment_type: EmploymentType;
  salary_min: number | null;
  salary_max: number | null;
  experience_min: number;
  experience_max: number | null;
  education_required: EducationLevel | null;
  skills_required: string[];
  description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  recruiter?: {
    company_name: string;
    company_logo_url: string | null;
  };
  matchScore?: number;
}

export const useRecommendedJobs = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["recommendedJobs", user?.id],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/recommended-jobs`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch recommendations");
      }

      const data = await response.json();
      return data.jobs as Job[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useAllJobs = () => {
  return useQuery({
    queryKey: ["allJobs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Job[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useJobById = (jobId: string | null) => {
  return useQuery({
    queryKey: ["job", jobId],
    queryFn: async () => {
      if (!jobId) return null;
      
      const { data, error } = await supabase
        .from("jobs")
        .select(`
          *,
          recruiter:recruiter_profiles(company_name, company_logo_url, about)
        `)
        .eq("id", jobId)
        .single();

      if (error) throw error;
      return data as Job & { recruiter: { company_name: string; company_logo_url: string | null; about: string | null } };
    },
    enabled: !!jobId,
  });
};
