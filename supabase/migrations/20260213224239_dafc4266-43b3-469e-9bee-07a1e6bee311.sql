-- FIX: Remove overly permissive public read policy on chat_messages
-- This exposed ALL customer support conversations (including health inquiries) to the public.
-- The edge function chat-messages already uses service_role_key to fetch messages,
-- so the public SELECT policy is unnecessary and dangerous.

DROP POLICY IF EXISTS "Anyone can view messages" ON public.chat_messages;