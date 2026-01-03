import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface RecruiterProfile {
  id: string;
  user_id: string;
  company_name: string;
  company_website: string | null;
  company_location: string | null;
  company_logo_url: string | null;
  about: string | null;
  company_size: string | null;
  industry: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  onboarding_completed: boolean | null;
  has_premium_access: boolean;
  created_at: string;
  updated_at: string;
}

export interface RecruiterProfileInput {
  company_name?: string;
  company_website?: string | null;
  company_location?: string | null;
  company_logo_url?: string | null;
  about?: string | null;
  company_size?: string | null;
  industry?: string | null;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  onboarding_completed?: boolean | null;
}

export const useRecruiterProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const profileQuery = useQuery({
    queryKey: ["recruiterProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from("recruiter_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      return data as RecruiterProfile | null;
    },
    enabled: !!user?.id,
  });

  const createProfile = useMutation({
    mutationFn: async (input: RecruiterProfileInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recruiter_profiles")
        .insert({
          user_id: user.id,
          company_name: input.company_name || "My Company",
          ...input,
        })
        .select()
        .single();

      if (error) throw error;
      return data as RecruiterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterProfile"] });
    },
    onError: (error) => {
      console.error("Create profile error:", error);
      toast.error("Failed to create company profile");
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (input: RecruiterProfileInput) => {
      if (!user?.id) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("recruiter_profiles")
        .update(input)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as RecruiterProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruiterProfile"] });
      toast.success("Company profile updated");
    },
    onError: (error) => {
      console.error("Update profile error:", error);
      toast.error("Failed to update company profile");
    },
  });

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    error: profileQuery.error,
    createProfile,
    updateProfile,
    refetch: profileQuery.refetch,
  };
};
