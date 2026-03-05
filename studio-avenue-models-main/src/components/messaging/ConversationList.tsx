import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MessageSquare } from 'lucide-react';

interface Booking {
  id: string;
  project_type: string | null;
  start_date: string;
  model_profiles?: { pseudo: string | null };
  professional_profiles?: { company_name: string };
}

interface ConversationListProps {
  userType: 'model' | 'professional' | 'admin';
  onSelectBooking: (bookingId: string) => void;
  selectedBookingId?: string;
}

export default function ConversationList({ userType, onSelectBooking, selectedBookingId }: ConversationListProps) {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, userType]);

  const fetchBookings = async () => {
    let query = supabase
      .from('bookings')
      .select(`
        id,
        project_type,
        start_date,
        model_profiles(pseudo),
        professional_profiles(company_name)
      `)
      .order('created_at', { ascending: false });

    if (userType === 'model') {
      const { data: profile } = await supabase
        .from('model_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (profile) {
        query = query.eq('model_id', profile.id);
      }
    } else if (userType === 'professional') {
      const { data: profile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('user_id', user!.id)
        .single();
      
      if (profile) {
        query = query.eq('professional_id', profile.id);
      }
    }

    const { data } = await query;
    if (data) {
      setBookings(data);
      fetchUnreadCounts(data.map(b => b.id));
    }
  };

  const fetchUnreadCounts = async (bookingIds: string[]) => {
    if (bookingIds.length === 0) return;

    const { data } = await supabase
      .from('messages')
      .select('booking_id')
      .in('booking_id', bookingIds)
      .eq('is_read', false)
      .neq('sender_id', user!.id);

    if (data) {
      const counts: Record<string, number> = {};
      data.forEach(msg => {
        counts[msg.booking_id] = (counts[msg.booking_id] || 0) + 1;
      });
      setUnreadCounts(counts);
    }
  };

  const getOtherPartyName = (booking: Booking) => {
    if (userType === 'model') {
      return booking.professional_profiles?.company_name || 'Professionnel';
    }
    return booking.model_profiles?.pseudo || 'Mannequin';
  };

  return (
    <div className="space-y-2">
      {bookings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Aucune conversation pour le moment.
        </p>
      ) : (
        bookings.map((booking) => (
          <Card
            key={booking.id}
            className={`cursor-pointer transition-colors hover:bg-muted/50 ${
              selectedBookingId === booking.id ? 'border-foreground' : ''
            }`}
            onClick={() => onSelectBooking(booking.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">{getOtherPartyName(booking)}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.project_type || 'Projet'} • {format(new Date(booking.start_date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
                {unreadCounts[booking.id] > 0 && (
                  <Badge className="bg-foreground text-background">
                    {unreadCounts[booking.id]}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
