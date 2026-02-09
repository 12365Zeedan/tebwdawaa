
ALTER TABLE public.chat_settings
ADD COLUMN IF NOT EXISTS offline_message text DEFAULT 'We are currently outside our working hours. We will get back to you as soon as possible. Thank you for your patience.',
ADD COLUMN IF NOT EXISTS offline_message_ar text DEFAULT 'نحن حالياً خارج أوقات العمل. سنعود إليك في أقرب وقت ممكن. شكراً لصبرك.',
ADD COLUMN IF NOT EXISTS duty_start_time time DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS duty_end_time time DEFAULT '23:00';
