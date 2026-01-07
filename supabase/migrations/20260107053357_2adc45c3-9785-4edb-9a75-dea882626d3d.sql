-- Create rate limiting table for OTP requests
CREATE TABLE public.otp_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  request_type TEXT NOT NULL, -- 'signup' or 'password_reset'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient lookups
CREATE INDEX idx_otp_rate_limits_email_type_created 
ON public.otp_rate_limits (email, request_type, created_at DESC);

-- Enable RLS (this table is only accessed by edge functions with service role)
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- No policies needed as only edge functions with service role access this table

-- Create function to clean up old rate limit records (older than 1 hour)
CREATE OR REPLACE FUNCTION public.cleanup_old_rate_limits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.otp_rate_limits
  WHERE created_at < now() - INTERVAL '1 hour';
END;
$$;