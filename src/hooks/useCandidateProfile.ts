import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type EducationLevel = "high_school" | "associate" | "bachelor" | "master" | "doctorate" | "other";

export interface CandidateProfile {
  id: string;
  user_id: string;
  headline: string | null;
  location: string | null;
  expected_salary_min: number | null;
  expected_salary_max: number | null;
  experience_years: number | null;
  education_level: EducationLevel | null;
  about: string | null;
  resume_url: string | null;
  skills: string[];
  created_at: string;
  updated_at: string;
}

export interface CandidateProfileInput {
  headline?: string | null;
  location?: string | null;
  expected_salary_min?: number | null;
  expected_salary_max?: number | null;
  experience_years?: number | null;
  education_level?: EducationLevel | null;
  about?: string | null;
  resume_url?: string | null;
  skills?: string[];
}

export const useCandidateProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["candidateProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as CandidateProfile | null;
    },
    enabled: !!user?.id,
  });

  const createProfile = useMutation({
    mutationFn: async (input: CandidateProfileInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: user.id,
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as CandidateProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast.success("Profile created successfully!");
    },
    onError: (error) => {
      console.error("Create profile error:", error);
      toast.error("Failed to create profile");
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (input: CandidateProfileInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("candidate_profiles")
        .update(input)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as CandidateProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidateProfile"] });
      toast.success("Profile updated successfully!");
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      toast.error("Failed to update profile");
    },
  });

  const calculateCompletion = (profile: CandidateProfile | null): number => {
    if (!profile) return 0;
    
    const fields = [
      !!profile.headline,
      !!profile.location,
      profile.skills && profile.skills.length > 0,
      profile.experience_years !== null,
      !!profile.education_level,
      !!profile.about,
      !!profile.resume_url,
      profile.expected_salary_min !== null,
    ];
    
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    createProfile,
    updateProfile,
    calculateCompletion,
    refetch: profileQuery.refetch,
  };
};
