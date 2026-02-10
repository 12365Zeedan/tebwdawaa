
-- 1. blog_post_views: views are recorded via record_blog_view() SECURITY DEFINER function
-- No need for public INSERT policy since the function bypasses RLS
DROP POLICY IF EXISTS "Anyone can record a view" ON public.blog_post_views;

-- 2. chat_conversations: conversations are created via chat-start edge function (service role)
DROP POLICY IF EXISTS "Anyone can create conversations" ON public.chat_conversations;

-- 3. newsletter_subscribers: restrict INSERT to only allow setting email field
-- Replace wide-open policy with one that ensures only email is meaningfully set
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Anyone can subscribe with email only"
ON public.newsletter_subscribers
FOR INSERT
TO public
WITH CHECK (
  is_active = true
  AND is_confirmed = false
  AND user_id IS NULL
);
