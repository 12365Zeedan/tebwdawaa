import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatSettings {
  welcome_message: string;
  welcome_message_ar: string;
  wait_message: string;
  wait_message_ar: string;
  whatsapp_number: string;
  is_online: boolean;
}

export function useChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Load saved conversation from localStorage
  useEffect(() => {
    const savedConvId = localStorage.getItem('chat_conversation_id');
    const savedPhone = localStorage.getItem('chat_phone');
    if (savedConvId && savedPhone) {
      setConversationId(savedConvId);
      setPhone(savedPhone);
      setIsStarted(true);
    }
  }, []);

  // Fetch chat settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase
        .from('chat_settings')
        .select('*')
        .limit(1)
        .single();
      if (data) setSettings(data as unknown as ChatSettings);
    };
    fetchSettings();
  }, []);

  // Fetch messages when conversation exists
  useEffect(() => {
    if (!conversationId) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as unknown as ChatMessage[]);
    };
    fetchMessages();
  }, [conversationId]);

  // Realtime subscription for new messages
  useEffect(() => {
    if (!conversationId) return;
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as unknown as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const startChat = useCallback(async () => {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      // Check if conversation exists for this phone
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('customer_phone', phone.trim())
        .eq('status', 'active')
        .limit(1)
        .maybeSingle();

      let convId: string;
      if (existing) {
        convId = existing.id;
      } else {
        const { data: newConv, error } = await supabase
          .from('chat_conversations')
          .insert({ customer_phone: phone.trim() })
          .select('id')
          .single();
        if (error || !newConv) throw error;
        convId = newConv.id;

        // Send welcome and wait messages as system messages
        const welcomeMsg = settings?.welcome_message || 'Welcome! How can we help you?';
        const waitMsg = settings?.wait_message || 'Please wait, the pharmacist will respond soon.';
        await supabase.from('chat_messages').insert([
          { conversation_id: convId, sender_type: 'pharmacist', message: welcomeMsg },
          { conversation_id: convId, sender_type: 'pharmacist', message: waitMsg },
        ]);
      }

      setConversationId(convId);
      setIsStarted(true);
      localStorage.setItem('chat_conversation_id', convId);
      localStorage.setItem('chat_phone', phone.trim());
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setLoading(false);
    }
  }, [phone, settings]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversationId) return;
    const msg = newMessage.trim();
    setNewMessage('');
    await supabase.from('chat_messages').insert({
      conversation_id: conversationId,
      sender_type: 'customer',
      message: msg,
    });
    await supabase.from('chat_conversations').update({ last_message_at: new Date().toISOString() }).eq('id', conversationId);
  }, [newMessage, conversationId]);

  return {
    isOpen, setIsOpen,
    phone, setPhone,
    conversationId,
    messages,
    settings,
    isStarted,
    newMessage, setNewMessage,
    loading,
    startChat,
    sendMessage,
  };
}
