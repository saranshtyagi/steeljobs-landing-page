-- Create admin invites table to track pending invitations
CREATE TABLE public.admin_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'revoked')),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.admin_invites ENABLE ROW LEVEL SECURITY;

-- Only admins can manage invites
CREATE POLICY "Admins can view all invites"
ON public.admin_invites
FOR SELECT
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can insert invites"
ON public.admin_invites
FOR INSERT
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Admins can update invites"
ON public.admin_invites
FOR UPDATE
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete invites"
ON public.admin_invites
FOR DELETE
USING (is_admin(auth.uid()));

-- Create index for faster lookup
CREATE INDEX idx_admin_invites_email ON public.admin_invites(email);
CREATE INDEX idx_admin_invites_token ON public.admin_invites(token);
CREATE INDEX idx_admin_invites_status ON public.admin_invites(status);