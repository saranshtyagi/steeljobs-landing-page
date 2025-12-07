import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ShortlistParams {
  candidateId: string;
  jobId: string;
}

export const useShortlistCandidate = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateId, jobId }: ShortlistParams) => {
      // Check if already shortlisted
      const { data: existing } = await supabase
        .from("applications")
        .select("id, status")
        .eq("job_id", jobId)
        .eq("candidate_id", candidateId)
        .maybeSingle();

      if (existing) {
        // If exists but not shortlisted, update to shortlisted
        if (existing.status !== "shortlisted") {
          const { data, error } = await supabase
            .from("applications")
            .update({ status: "shortlisted" })
            .eq("id", existing.id)
            .select()
            .single();

          if (error) throw error;
          return { data, updated: true };
        }
        throw new Error("Candidate is already shortlisted for this job");
      }

      // Create new application with shortlisted status
      const { data, error } = await supabase
        .from("applications")
        .insert({
          job_id: jobId,
          candidate_id: candidateId,
          status: "shortlisted",
        })
        .select()
        .single();

      if (error) throw error;
      return { data, created: true };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      if (result.updated) {
        toast.success("Candidate status updated to shortlisted");
      } else {
        toast.success("Candidate shortlisted successfully");
      }
    },
    onError: (error) => {
      console.error("Shortlist error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to shortlist candidate");
    },
  });
};

export const useBulkShortlist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ candidateIds, jobId }: { candidateIds: string[]; jobId: string }) => {
      const results = await Promise.allSettled(
        candidateIds.map(async (candidateId) => {
          // Check if already exists
          const { data: existing } = await supabase
            .from("applications")
            .select("id, status")
            .eq("job_id", jobId)
            .eq("candidate_id", candidateId)
            .maybeSingle();

          if (existing) {
            if (existing.status !== "shortlisted") {
              await supabase
                .from("applications")
                .update({ status: "shortlisted" })
                .eq("id", existing.id);
            }
            return { candidateId, skipped: existing.status === "shortlisted" };
          }

          await supabase.from("applications").insert({
            job_id: jobId,
            candidate_id: candidateId,
            status: "shortlisted",
          });

          return { candidateId, created: true };
        })
      );

      const successful = results.filter(r => r.status === "fulfilled").length;
      return { successful, total: candidateIds.length };
    },
    onSuccess: ({ successful, total }) => {
      queryClient.invalidateQueries({ queryKey: ["jobApplications"] });
      queryClient.invalidateQueries({ queryKey: ["recruiterJobs"] });
      toast.success(`${successful} of ${total} candidates shortlisted`);
    },
    onError: (error) => {
      console.error("Bulk shortlist error:", error);
      toast.error("Failed to shortlist candidates");
    },
  });
};
