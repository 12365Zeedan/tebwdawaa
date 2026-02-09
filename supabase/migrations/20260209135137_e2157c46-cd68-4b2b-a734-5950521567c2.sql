
-- Chat conversations table
CREATE TABLE public.chat_conversations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_phone TEXT NOT NULL,
  customer_name TEXT,
  welcome_message TEXT DEFAULT 'مرحباً بك في صيدليتنا! كيف يمكننا مساعدتك؟',
  wait_message TEXT DEFAULT 'يرجى الانتظار، سيتواصل معك الصيدلي في أقرب وقت ممكن.',
  status TEXT NOT NULL DEFAULT 'active',
  last_message_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages table
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
  sender_type TEXT NOT NULL DEFAULT 'customer', -- 'customer' or 'pharmacist'
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat settings table for admin-editable messages
CREATE TABLE public.chat_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  welcome_message TEXT DEFAULT 'مرحباً بك في صيدليتنا! كيف يمكننا مساعدتك؟',
  welcome_message_ar TEXT DEFAULT 'مرحباً بك في صيدليتنا! كيف يمكننا مساعدتك؟',
  wait_message TEXT DEFAULT 'Please wait, the pharmacist will respond as soon as possible.',
  wait_message_ar TEXT DEFAULT 'يرجى الانتظار، سيتواصل معك الصيدلي في أقرب وقت ممكن.',
  whatsapp_number TEXT DEFAULT '+966581545101',
  is_online BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_settings ENABLE ROW LEVEL SECURITY;

-- Chat conversations: anyone can create, admins can view all
CREATE POLICY "Anyone can create conversations" ON public.chat_conversations FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view their conversation by phone" ON public.chat_conversations FOR SELECT USING (true);
CREATE POLICY "Anyone can update conversations" ON public.chat_conversations FOR UPDATE USING (true);

-- Chat messages: anyone can insert/view messages
CREATE POLICY "Anyone can send messages" ON public.chat_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can view messages" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "Anyone can update messages" ON public.chat_messages FOR UPDATE USING (true);

-- Chat settings: public read, admin write
CREATE POLICY "Anyone can read chat settings" ON public.chat_settings FOR SELECT USING (true);
CREATE POLICY "Admins can update chat settings" ON public.chat_settings FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert chat settings" ON public.chat_settings FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Triggers for updated_at
CREATE TRIGGER update_chat_conversations_updated_at BEFORE UPDATE ON public.chat_conversations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_chat_settings_updated_at BEFORE UPDATE ON public.chat_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_conversations;

-- Insert default chat settings
INSERT INTO public.chat_settings (welcome_message, wait_message, whatsapp_number)
VALUES ('Welcome to our pharmacy! How can we help you?', 'Please wait, the pharmacist will respond as soon as possible.', '+966581545101');
