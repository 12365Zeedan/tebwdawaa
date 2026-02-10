-- Fix newsletter_subscribers: restrict SELECT to own records only
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.newsletter_subscribers;

-- Create a properly scoped policy: authenticated users see only their own, unauthenticated see nothing
CREATE POLICY "Users can view their own subscription"
ON public.newsletter_subscribers
FOR SELECT
USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);