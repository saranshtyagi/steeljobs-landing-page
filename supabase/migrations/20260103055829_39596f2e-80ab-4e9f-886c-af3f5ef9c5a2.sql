-- Allow admins to view all candidate profiles
CREATE POLICY "Admins can view all candidate profiles"
ON public.candidate_profiles
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to view all applications
CREATE POLICY "Admins can view all applications"
ON public.applications
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to view all recruiter profiles (beyond just public company info)
CREATE POLICY "Admins can view all recruiter profiles"
ON public.recruiter_profiles
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to view all jobs (including inactive)
CREATE POLICY "Admins can view all jobs"
ON public.jobs
FOR SELECT
USING (is_admin(auth.uid()));

-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
USING (is_admin(auth.uid()));