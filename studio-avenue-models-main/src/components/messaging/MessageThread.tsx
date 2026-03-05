import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_type: string;
  created_at: string;
  is_read: boolean;
}

interface MessageThreadProps {
  bookingId: string;
  currentUserType: 'model' | 'professional' | 'admin';
}

export default function MessageThread({ bookingId, currentUserType }: MessageThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchMessages();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`messages-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    
    if (data) {
      setMessages(data);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !user) return;

    setSending(true);
    const { error } = await supabase
      .from('messages')
      .insert({
        booking_id: bookingId,
        sender_id: user.id,
        sender_type: currentUserType,
        content: newMessage.trim()
      });

    if (!error) {
      setNewMessage('');
    }
    setSending(false);
  };

  const getSenderLabel = (senderType: string) => {
    switch (senderType) {
      case 'model': return 'Mannequin';
      case 'professional': return 'Professionnel';
      case 'admin': return 'Agence';
      default: return senderType;
    }
  };

  return (
    <div className="flex flex-col h-[400px]">
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucun message. Commencez la conversation !
            </p>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?.id;
              return (
                <div
                  key={message.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}
                >
                  <div className="text-xs text-muted-foreground mb-1">
                    {getSenderLabel(message.sender_type)} • {format(new Date(message.created_at), 'dd MMM HH:mm', { locale: fr })}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                      isOwn
                        ? 'bg-foreground text-background'
                        : 'bg-muted'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
      
      <div className="border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Votre message..."
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
