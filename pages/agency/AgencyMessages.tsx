import { useState, useEffect } from 'react';
import DashboardLayout, { agencyNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import MessageThread from '@/components/messaging/MessageThread';

interface Booking {
  id: string;
  project_type: string | null;
  start_date: string;
  model_profiles: { pseudo: string | null };
  professional_profiles: { company_name: string };
}

export default function AgencyMessages() {
  const { user, loading, role } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || role !== 'admin')) {
      navigate('/connexion');
    }
  }, [user, loading, role, navigate]);

  useEffect(() => {
    if (user && role === 'admin') {
      fetchBookings();
    }
  }, [user, role]);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select(`
        id,
        project_type,
        start_date,
        model_profiles(pseudo),
        professional_profiles(company_name)
      `)
      .order('created_at', { ascending: false });

    if (data) {
      setBookings(data as Booking[]);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Chargement...</div>;
  }

  return (
    <DashboardLayout title="Messages" navItems={agencyNavItems}>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Toutes les conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucune conversation.
                </p>
              ) : (
                bookings.map((booking) => (
                  <Card
                    key={booking.id}
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      selectedBookingId === booking.id ? 'border-foreground' : ''
                    }`}
                    onClick={() => setSelectedBookingId(booking.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <MessageSquare className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {booking.model_profiles?.pseudo || 'Mannequin'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            ↔ {booking.professional_profiles?.company_name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(booking.start_date), 'dd MMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">
              {selectedBookingId ? 'Discussion' : 'Sélectionnez une conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {selectedBookingId ? (
              <MessageThread
                bookingId={selectedBookingId}
                currentUserType="admin"
              />
            ) : (
              <p className="text-center text-muted-foreground py-16">
                Sélectionnez une conversation pour voir les messages
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
