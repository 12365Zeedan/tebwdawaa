
-- 1. Add parent_comment_id for threaded replies
ALTER TABLE public.blog_comments
ADD COLUMN parent_comment_id uuid REFERENCES public.blog_comments(id) ON DELETE CASCADE;

CREATE INDEX idx_blog_comments_parent ON public.blog_comments(parent_comment_id);

-- 2. Create newsletter_subscribers table
CREATE TABLE public.newsletter_subscribers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  user_id uuid,
  is_confirmed boolean NOT NULL DEFAULT false,
  is_active boolean NOT NULL DEFAULT true,
  subscribed_at timestamp with time zone NOT NULL DEFAULT now(),
  unsubscribed_at timestamp with time zone,
  confirmation_token text DEFAULT encode(gen_random_bytes(32), 'hex'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert)
CREATE POLICY "Anyone can subscribe"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.newsletter_subscribers
FOR SELECT
USING (
  (auth.uid() IS NOT NULL AND auth.uid() = user_id)
  OR (auth.uid() IS NULL)
);

-- Users can update their own subscription (unsubscribe)
CREATE POLICY "Anyone can update subscription by email"
ON public.newsletter_subscribers
FOR UPDATE
USING (true);

-- Admins can manage all subscriptions
CREATE POLICY "Admins can manage subscriptions"
ON public.newsletter_subscribers
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_newsletter_subscribers_email ON public.newsletter_subscribers(email);
CREATE INDEX idx_newsletter_subscribers_active ON public.newsletter_subscribers(is_active) WHERE is_active = true;

-- Trigger for updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
BEFORE UPDATE ON public.newsletter_subscribers
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();
