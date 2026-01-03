import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PremiumAccessRequest {
  recruiterName: string;
  recruiterEmail: string;
  companyName: string;
  companyPhone: string | null;
  recruiterId: string;
}

export const useRequestPremiumAccess = () => {
  return useMutation({
    mutationFn: async (request: PremiumAccessRequest) => {
      const { data, error } = await supabase.functions.invoke("request-premium-access", {
        body: request,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success("Premium access request submitted! Our sales team will contact you within 24-48 hours.");
    },
    onError: (error) => {
      console.error("Premium access request error:", error);
      toast.error("Failed to submit request. Please try again.");
    },
  });
};
