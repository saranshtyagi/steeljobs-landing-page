-- Add email_id column to track Resend email ID for delivery status
ALTER TABLE public.admin_invites 
ADD COLUMN email_id text,
ADD COLUMN email_status text DEFAULT 'sending';