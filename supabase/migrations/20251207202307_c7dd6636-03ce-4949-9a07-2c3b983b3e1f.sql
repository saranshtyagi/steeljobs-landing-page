-- Update email_logs table with additional columns
ALTER TABLE public.email_logs 
ADD COLUMN IF NOT EXISTS recipients jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS job_id uuid REFERENCES public.jobs(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS template_id text;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_email_logs_recruiter_id ON public.email_logs(recruiter_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);