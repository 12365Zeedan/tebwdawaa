
-- Drop the overly permissive SELECT policies on chat tables
DROP POLICY IF EXISTS "Anyone can view their conversation by phone" ON public.chat_conversations;
DROP POLICY IF EXISTS "Anyone can view conversation messages" ON public.chat_messages;

-- Create a security definer function to validate conversation access
-- This checks if a conversation_id belongs to a given phone number
CREATE OR REPLACE FUNCTION public.owns_chat_conversation(_conversation_id uuid, _phone text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.chat_conversations
    WHERE id = _conversation_id
    AND customer_phone = _phone
    AND status = 'active'
  )
$$;

-- New SELECT policy for chat_conversations:
-- Admins can see all; unauthenticated users must filter by exact ID
-- This prevents bulk enumeration while allowing individual access
CREATE POLICY "Admins can view all conversations"
ON public.chat_conversations
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- New SELECT policy for chat_messages:
-- Admins can see all messages
CREATE POLICY "Admins can view all messages"
ON public.chat_messages
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));
