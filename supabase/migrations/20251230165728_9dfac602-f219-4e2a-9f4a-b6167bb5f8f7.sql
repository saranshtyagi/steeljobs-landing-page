-- Drop the existing check constraint first
ALTER TABLE public.feature_requests DROP CONSTRAINT IF EXISTS feature_requests_request_type_check;