import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface EmailRecipient {
  email: string;
  name: string;
  candidateId: string;
}

export interface SendEmailData {
  recipients: EmailRecipient[];
  subject: string;
  body: string;
  templateId?: string;
  jobId?: string;
}

export interface EmailLog {
  id: string;
  recruiter_id: string;
  subject: string;
  body_preview: string | null;
  template_id: string | null;
  job_id: string | null;
  sent_to_count: number;
  recipients: EmailRecipient[] | null;
  created_at: string;
  job?: {
    title: string;
  } | null;
}

export const EMAIL_TEMPLATES = {
  shortlist: {
    id: "shortlist",
    name: "Shortlist Notification",
    subject: "Great news! You've been shortlisted for {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

We are excited to inform you that your application for the {{jobTitle}} position at {{companyName}} has been shortlisted!

Our team was impressed with your profile and would like to move forward with your application. We will be in touch soon with next steps regarding the interview process.

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  interview: {
    id: "interview",
    name: "Interview Invitation",
    subject: "Interview Invitation: {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

We are pleased to invite you for an interview for the {{jobTitle}} position at {{companyName}}.

Please let us know your availability for the coming week, and we will schedule a convenient time for the interview.

Looking forward to speaking with you!

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  request_details: {
    id: "request_details",
    name: "Request for Details",
    subject: "Additional Information Required - {{jobTitle}} Application",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}}.

To proceed with your application, we would appreciate if you could provide us with some additional information:

1. Updated resume/CV
2. Portfolio or work samples (if applicable)
3. References

Please reply to this email with the requested documents at your earliest convenience.

Best regards,
{{recruiterName}}
{{companyName}}`
  },
  rejection: {
    id: "rejection",
    name: "Application Update",
    subject: "Update on your application for {{jobTitle}} at {{companyName}}",
    body: `Dear {{candidateName}},

Thank you for your interest in the {{jobTitle}} position at {{companyName}} and for taking the time to apply.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current requirements.

We appreciate your interest in our company and encourage you to apply for future opportunities that match your skills and experience.

We wish you the best in your job search.

Best regards,
{{recruiterName}}
{{companyName}}`
  }
};

export const useSendEmail = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SendEmailData) => {
      const { data: response, error } = await supabase.functions.invoke("send-email", {
        body: data,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["emailLogs"] });
      if (data.failed > 0) {
        toast.warning(`Sent ${data.sent} emails, ${data.failed} failed`);
      } else {
        toast.success(`Successfully sent ${data.sent} email${data.sent > 1 ? "s" : ""}`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send email");
    },
  });
};

export const useEmailLogs = () => {
  return useQuery({
    queryKey: ["emailLogs"],
    queryFn: async () => {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error("Not authenticated");

      const { data: recruiterProfile } = await supabase
        .from("recruiter_profiles")
        .select("id")
        .eq("user_id", user.user.id)
        .single();

      if (!recruiterProfile) throw new Error("Not a recruiter");

      const { data, error } = await supabase
        .from("email_logs")
        .select(`
          *,
          job:jobs(title)
        `)
        .eq("recruiter_id", recruiterProfile.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the data to handle Json type for recipients
      return (data || []).map(log => ({
        ...log,
        recipients: (log.recipients as unknown) as EmailRecipient[] | null,
      })) as EmailLog[];
    },
  });
};
