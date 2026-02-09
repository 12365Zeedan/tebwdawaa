import React, { useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useChatWidget } from '@/hooks/useChatWidget';
import { format } from 'date-fns';

export function ChatWidget() {
  const {
    isOpen, setIsOpen,
    phone, setPhone,
    messages,
    isStarted,
    newMessage, setNewMessage,
    loading,
    startChat,
    sendMessage,
  } = useChatWidget();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isStarted) sendMessage();
      else startChat();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl transition-all hover:scale-105 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle className="w-7 h-7" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-4rem)] bg-background border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-[#25D366] text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Pharmacy Chat</p>
                <p className="text-xs opacity-80">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 rounded-full p-1 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!isStarted ? (
            /* Phone Input Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4">
              <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center">
                <Phone className="w-8 h-8 text-[#25D366]" />
              </div>
              <h3 className="font-semibold text-foreground text-center">Start a Conversation</h3>
              <p className="text-sm text-muted-foreground text-center">
                Please enter your phone number to start chatting with our pharmacist.
              </p>
              <Input
                type="tel"
                placeholder="+966 5XX XXX XXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-center"
                dir="ltr"
              />
              <Button
                onClick={startChat}
                disabled={!phone.trim() || loading}
                className="w-full bg-[#25D366] hover:bg-[#25D366]/90 text-white"
              >
                {loading ? 'Starting...' : 'Start Chat'}
              </Button>
            </div>
          ) : (
            <>
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-[#ECE5DD]/30">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      'max-w-[80%] rounded-lg px-3 py-2 text-sm',
                      msg.sender_type === 'customer'
                        ? 'ml-auto bg-[#DCF8C6] text-foreground'
                        : 'mr-auto bg-white text-foreground shadow-sm'
                    )}
                  >
                    <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      {format(new Date(msg.created_at), 'HH:mm')}
                    </p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 border-t bg-background flex gap-2 shrink-0">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  size="icon"
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="bg-[#25D366] hover:bg-[#25D366]/90 text-white shrink-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
