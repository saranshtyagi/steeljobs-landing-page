-- Create login_logs table for tracking user logins
CREATE TABLE public.login_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    email text NOT NULL,
    login_at timestamp with time zone NOT NULL DEFAULT now(),
    ip_address text,
    user_agent text,
    success boolean NOT NULL DEFAULT true,
    failure_reason text
);

-- Enable RLS
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view login logs
CREATE POLICY "Admins can view all login logs"
ON public.login_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert login logs (via edge function with service role)
CREATE POLICY "Service role can insert login logs"
ON public.login_logs
FOR INSERT
WITH CHECK (true);

-- Create activity_logs table for general activity tracking
CREATE TABLE public.activity_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid,
    action text NOT NULL,
    entity_type text,
    entity_id uuid,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view all activity logs"
ON public.activity_logs
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Service role can insert activity logs
CREATE POLICY "Service role can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Add is_active and last_login columns to profiles if they don't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON public.login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_at ON public.login_logs(login_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = 'admin'::app_role
  )
$$;