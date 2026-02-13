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
  offline_message: string;
  offline_message_ar: string;
  duty_start_time: string;
  duty_end_time: string;
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

  // Fetch chat settings (public read)
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

  // Fetch messages via edge function when conversation exists
  useEffect(() => {
    if (!conversationId || !phone) return;
    const fetchMessages = async () => {
      try {
        // FIX: Removed dead supabase.functions.invoke call that was never used.
        // The edge function requires query params which .invoke doesn't support for GET,
        // so we use fetch directly.
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
        const res = await fetch(
          `${supabaseUrl}/functions/v1/chat-messages?conversation_id=${encodeURIComponent(conversationId)}&phone=${encodeURIComponent(phone)}`,
          { headers: { 'apikey': anonKey } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.messages) setMessages(data.messages);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [conversationId, phone]);

  // Realtime subscription for new messages + conversation status
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
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'chat_conversations',
        filter: `id=eq.${conversationId}`,
      }, (payload: any) => {
        if (payload.new?.status === 'closed') {
          setConversationId(null);
          setIsStarted(false);
          setMessages([]);
          setPhone('');
          localStorage.removeItem('chat_conversation_id');
          localStorage.removeItem('chat_phone');
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [conversationId]);

  const startChat = useCallback(async () => {
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/chat-start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
        },
        body: JSON.stringify({ phone: phone.trim() }),
      });

      if (!res.ok) throw new Error('Failed to start chat');
      const data = await res.json();
      const convId = data.conversation_id;

      setConversationId(convId);
      setIsStarted(true);
      localStorage.setItem('chat_conversation_id', convId);
      localStorage.setItem('chat_phone', phone.trim());
    } catch (err) {
      console.error('Failed to start chat:', err);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  const sendMessage = useCallback(async () => {
    if (!newMessage.trim() || !conversationId || !phone) return;
    const msg = newMessage.trim();
    setNewMessage('');
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
      await fetch(
        `${supabaseUrl}/functions/v1/chat-messages?conversation_id=${encodeURIComponent(conversationId)}&phone=${encodeURIComponent(phone)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': anonKey,
          },
          body: JSON.stringify({ message: msg }),
        }
      );
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  }, [newMessage, conversationId, phone]);

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
