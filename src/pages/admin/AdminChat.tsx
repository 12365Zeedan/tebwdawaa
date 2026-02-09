import React, { useState, useEffect, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { Send, MessageCircle, Phone, Clock, Settings, Search, Volume2, VolumeX, ExternalLink, XCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const playNotificationSound = () => {
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.value = 880;
  osc.type = 'sine';
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.3);
};

interface Conversation {
  id: string;
  customer_phone: string;
  customer_name: string | null;
  status: string;
  last_message_at: string;
  created_at: string;
}

interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface ChatSettings {
  id: string;
  welcome_message: string;
  welcome_message_ar: string;
  wait_message: string;
  wait_message_ar: string;
  whatsapp_number: string;
  is_online: boolean;
}

export default function AdminChat() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');
  const [search, setSearch] = useState('');
  const [settings, setSettings] = useState<ChatSettings | null>(null);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [settingsLoading, setSettingsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Fetch unread counts
  const fetchUnreadCounts = async () => {
    const { data } = await supabase
      .from('chat_messages')
      .select('conversation_id')
      .eq('sender_type', 'customer')
      .eq('is_read', false);
    if (data) {
      const counts: Record<string, number> = {};
      data.forEach((m: any) => {
        counts[m.conversation_id] = (counts[m.conversation_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      const { data } = await supabase
        .from('chat_conversations')
        .select('*')
        .order('last_message_at', { ascending: false });
      if (data) setConversations(data as unknown as Conversation[]);
    };
    fetchConversations();
    fetchUnreadCounts();

    const channel = supabase
      .channel('admin-conversations')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chat_conversations' }, () => {
        fetchConversations();
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload: any) => {
        fetchUnreadCounts();
        if (payload.new?.sender_type === 'customer' && soundEnabled) {
          playNotificationSound();
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [soundEnabled]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConv) return;
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedConv)
        .order('created_at', { ascending: true });
      if (data) setMessages(data as unknown as ChatMessage[]);

      // Mark as read
      await supabase
        .from('chat_messages')
        .update({ is_read: true })
        .eq('conversation_id', selectedConv)
        .eq('sender_type', 'customer')
        .eq('is_read', false);
      fetchUnreadCounts();
    };
    fetchMessages();

    const channel = supabase
      .channel(`admin-chat-${selectedConv}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${selectedConv}`,
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as unknown as ChatMessage]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedConv]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Fetch settings
  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('chat_settings').select('*').limit(1).single();
      if (data) setSettings(data as unknown as ChatSettings);
    };
    fetchSettings();
  }, []);

  const sendReply = async () => {
    if (!reply.trim() || !selectedConv) return;
    const msg = reply.trim();
    setReply('');
    await supabase.from('chat_messages').insert({
      conversation_id: selectedConv,
      sender_type: 'pharmacist',
      message: msg,
    });
    await supabase.from('chat_conversations').update({ last_message_at: new Date().toISOString() }).eq('id', selectedConv);
  };

  const openWhatsApp = (phone: string, message?: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '').replace(/^\+/, '');
    const url = message
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/${cleanPhone}`;
    window.open(url, '_blank');
  };

  const sendViaWhatsApp = () => {
    if (!reply.trim() || !selectedConversation) return;
    openWhatsApp(selectedConversation.customer_phone, reply.trim());
  };

  const saveSettings = async () => {
    if (!settings) return;
    setSettingsLoading(true);
    const { error } = await supabase
      .from('chat_settings')
      .update({
        welcome_message: settings.welcome_message,
        welcome_message_ar: settings.welcome_message_ar,
        wait_message: settings.wait_message,
        wait_message_ar: settings.wait_message_ar,
        whatsapp_number: settings.whatsapp_number,
        is_online: settings.is_online,
      })
      .eq('id', settings.id);
    setSettingsLoading(false);
    if (!error) toast({ title: 'Settings saved successfully' });
    else toast({ title: 'Error saving settings', variant: 'destructive' });
  };

  const filteredConversations = conversations.filter(c =>
    c.customer_phone.includes(search) || c.customer_name?.toLowerCase().includes(search.toLowerCase())
  );

  const selectedConversation = conversations.find(c => c.id === selectedConv);

  return (
    <AdminLayout>
      <div className="p-4 md:p-6">
        <h1 className="text-2xl font-bold mb-4">Chat Management</h1>
        <Tabs defaultValue="conversations">
          <TabsList>
            <TabsTrigger value="conversations"><MessageCircle className="w-4 h-4 mr-1" /> Conversations</TabsTrigger>
            <TabsTrigger value="settings"><Settings className="w-4 h-4 mr-1" /> Settings</TabsTrigger>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="ml-auto gap-1.5"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {soundEnabled ? 'Sound On' : 'Sound Off'}
            </Button>
          </TabsList>

          <TabsContent value="conversations" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-240px)]">
              {/* Conversation List */}
              <Card className="md:col-span-1 flex flex-col">
                <CardHeader className="pb-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    {filteredConversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConv(conv.id)}
                        className={cn(
                          'w-full text-left px-4 py-3 border-b hover:bg-muted/50 transition-colors',
                          selectedConv === conv.id && 'bg-muted'
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm" dir="ltr">{conv.customer_phone}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {unreadCounts[conv.id] > 0 && (
                              <span className="min-w-5 h-5 rounded-full bg-[#25D366] text-white text-xs flex items-center justify-center px-1 font-bold">
                                {unreadCounts[conv.id]}
                              </span>
                            )}
                            <Badge variant={conv.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                              {conv.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {format(new Date(conv.last_message_at), 'MMM dd, HH:mm')}
                        </div>
                      </button>
                    ))}
                    {filteredConversations.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm py-8">No conversations yet</p>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>

              {/* Chat Area */}
              <Card className="md:col-span-2 flex flex-col">
                {selectedConv && selectedConversation ? (
                  <>
                    <CardHeader className="pb-2 border-b">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <CardTitle className="text-base" dir="ltr">{selectedConversation.customer_phone}</CardTitle>
                          <span className="text-xs text-muted-foreground">
                            Started {format(new Date(selectedConversation.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedConversation.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                await supabase.from('chat_conversations').update({ status: 'closed' }).eq('id', selectedConv);
                                // Send a system message
                                await supabase.from('chat_messages').insert({
                                  conversation_id: selectedConv!,
                                  sender_type: 'pharmacist',
                                  message: 'This conversation has been closed. Thank you!',
                                });
                                setSelectedConv(null);
                                toast({ title: 'Conversation closed' });
                              }}
                              className="gap-1.5 text-destructive border-destructive hover:bg-destructive/10"
                            >
                              <XCircle className="w-4 h-4" />
                              Close
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openWhatsApp(selectedConversation.customer_phone)}
                            className="gap-1.5 text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10"
                          >
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          WhatsApp
                          <ExternalLink className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                      <ScrollArea className="flex-1 p-3">
                        <div className="space-y-2">
                          {messages.map(msg => (
                            <div
                              key={msg.id}
                              className={cn(
                                'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                                msg.sender_type === 'pharmacist'
                                  ? 'ml-auto bg-[#DCF8C6] text-foreground'
                                  : 'mr-auto bg-white border text-foreground shadow-sm'
                              )}
                            >
                              <p className="text-[10px] font-medium text-muted-foreground mb-1">
                                {msg.sender_type === 'pharmacist' ? 'Pharmacist' : 'Customer'}
                              </p>
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                              <p className="text-[10px] text-muted-foreground mt-1 text-right">
                                {format(new Date(msg.created_at), 'HH:mm')}
                              </p>
                            </div>
                          ))}
                          <div ref={messagesEndRef} />
                        </div>
                      </ScrollArea>
                      <div className="p-3 border-t flex gap-2">
                        <Input
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendReply(); }}}
                          placeholder="Type your reply..."
                          className="flex-1"
                        />
                        <Button onClick={sendReply} disabled={!reply.trim()} size="icon" className="bg-[#25D366] hover:bg-[#25D366]/90 text-white" title="Send in chat">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button onClick={sendViaWhatsApp} disabled={!reply.trim()} size="icon" variant="outline" className="text-[#25D366] border-[#25D366] hover:bg-[#25D366]/10 shrink-0" title="Send via WhatsApp">
                          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        </Button>
                      </div>
                    </CardContent>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-30" />
                      <p>Select a conversation to start replying</p>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="mt-4">
            {settings && (
              <Card className="max-w-2xl">
                <CardHeader>
                  <CardTitle>Chat Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Welcome Message (English)</Label>
                    <Textarea
                      value={settings.welcome_message}
                      onChange={(e) => setSettings({ ...settings, welcome_message: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Welcome Message (Arabic)</Label>
                    <Textarea
                      value={settings.welcome_message_ar}
                      onChange={(e) => setSettings({ ...settings, welcome_message_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>Wait Message (English)</Label>
                    <Textarea
                      value={settings.wait_message}
                      onChange={(e) => setSettings({ ...settings, wait_message: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Wait Message (Arabic)</Label>
                    <Textarea
                      value={settings.wait_message_ar}
                      onChange={(e) => setSettings({ ...settings, wait_message_ar: e.target.value })}
                      dir="rtl"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp Number</Label>
                    <Input
                      value={settings.whatsapp_number}
                      onChange={(e) => setSettings({ ...settings, whatsapp_number: e.target.value })}
                      dir="ltr"
                    />
                  </div>
                  <Button onClick={saveSettings} disabled={settingsLoading}>
                    {settingsLoading ? 'Saving...' : 'Save Settings'}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
