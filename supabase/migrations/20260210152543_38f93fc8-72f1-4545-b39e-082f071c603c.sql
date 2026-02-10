
-- Fix chat system RLS: restrict UPDATE to admin-only, tighten INSERT

-- Drop overly permissive UPDATE policies
DROP POLICY IF EXISTS "Anyone can update conversations" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can update messages" ON public.chat_messages;

-- Admin-only UPDATE on conversations (close conversations, update status)
CREATE POLICY "Only admins can update conversations"
ON public.chat_conversations
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admin-only UPDATE on messages (mark as read, etc.)
CREATE POLICY "Only admins can update messages"
ON public.chat_messages
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Tighten INSERT on chat_messages: require conversation exists
DROP POLICY IF EXISTS "Anyone can send messages" ON public.chat_messages;
CREATE POLICY "Anyone can insert messages to existing conversations"
ON public.chat_messages
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = conversation_id
    AND status = 'active'
  )
);
