-- Allow service role to delete candidate profiles (for admin invite flow)
CREATE POLICY "Service role can delete candidate profiles"
ON public.candidate_profiles
FOR DELETE
USING (true);

-- Allow service role to delete recruiter profiles (for admin invite flow)
CREATE POLICY "Service role can delete recruiter profiles"
ON public.recruiter_profiles
FOR DELETE
USING (true);

-- Allow service role to manage user roles (for admin invite flow)
CREATE POLICY "Service role can insert user roles"
ON public.user_roles
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Service role can delete user roles"
ON public.user_roles
FOR DELETE
USING (true);