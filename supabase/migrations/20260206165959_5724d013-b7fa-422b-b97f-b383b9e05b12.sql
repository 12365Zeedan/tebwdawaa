
-- Tighten the UPDATE policy: only allow updating is_active and unsubscribed_at by matching email
DROP POLICY IF EXISTS "Anyone can update subscription by email" ON public.newsletter_subscribers;

CREATE POLICY "Subscribers can unsubscribe by email match"
ON public.newsletter_subscribers
FOR UPDATE
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (confirmation_token IS NOT NULL)
);
