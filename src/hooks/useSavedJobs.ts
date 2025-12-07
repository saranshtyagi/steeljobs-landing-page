import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCandidateProfile } from "./useCandidateProfile";
import { toast } from "sonner";

export interface SavedJob {
  id: string;
  candidate_id: string;
  job_id: string;
  created_at: string;
  job?: {
    id: string;
    title: string;
    company_name: string;
    location: string;
    employment_type: string;
    salary_min: number | null;
    salary_max: number | null;
  };
}

export const useSavedJobs = () => {
  const { profile } = useCandidateProfile();

  return useQuery({
    queryKey: ["savedJobs", profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];

      const { data, error } = await supabase
        .from("saved_jobs")
        .select(`
          *,
          job:jobs(id, title, company_name, location, employment_type, salary_min, salary_max)
        `)
        .eq("candidate_id", profile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as SavedJob[];
    },
    enabled: !!profile?.id,
  });
};

export const useToggleSaveJob = () => {
  const { profile } = useCandidateProfile();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (jobId: string) => {
      if (!profile?.id) throw new Error("Please complete your profile first");

      // Check if already saved
      const { data: existing } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", jobId)
        .eq("candidate_id", profile.id)
        .maybeSingle();

      if (existing) {
        // Unsave
        const { error } = await supabase
          .from("saved_jobs")
          .delete()
          .eq("id", existing.id);

        if (error) throw error;
        return { saved: false };
      } else {
        // Save
        const { error } = await supabase
          .from("saved_jobs")
          .insert({
            job_id: jobId,
            candidate_id: profile.id,
          });

        if (error) throw error;
        return { saved: true };
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["savedJobs"] });
      toast.success(result.saved ? "Job saved!" : "Job removed from saved");
    },
    onError: (error) => {
      console.error("Save job error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to save job");
    },
  });
};

export const useIsJobSaved = (jobId: string | null) => {
  const { profile } = useCandidateProfile();

  return useQuery({
    queryKey: ["isJobSaved", jobId, profile?.id],
    queryFn: async () => {
      if (!profile?.id || !jobId) return false;

      const { data } = await supabase
        .from("saved_jobs")
        .select("id")
        .eq("job_id", jobId)
        .eq("candidate_id", profile.id)
        .maybeSingle();

      return !!data;
    },
    enabled: !!profile?.id && !!jobId,
  });
};
