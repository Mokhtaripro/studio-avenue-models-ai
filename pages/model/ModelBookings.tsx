import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { modelNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar, MapPin, DollarSign } from 'lucide-react';

interface Booking {
  id: string;
  start_date: string;
  end_date: string;
  status: string;
  project_type: string | null;
  project_description: string | null;
  location: string | null;
  final_price: number | null;
  professional_profiles: {
    company_name: string;
  } | null;
}

export default function ModelBookings() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    const { data: profile } = await supabase
      .from('model_profiles')
      .select('id')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (profile) {
      const { data } = await supabase
        .from('bookings')
        .select(`
          *,
          professional_profiles (company_name)
        `)
        .eq('model_id', profile.id)
        .order('start_date', { ascending: false });
      
      setBookings(data || []);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: 'En attente', className: 'bg-champagne/20 text-champagne-foreground' },
    quoted: { label: 'Devis envoyé', className: 'bg-blue-100 text-blue-800' },
    confirmed: { label: 'Confirmé', className: 'bg-green-100 text-green-800' },
    completed: { label: 'Terminé', className: 'bg-gray-100 text-gray-800' },
    cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800' },
  };

  const pendingBookings = bookings.filter((b) => ['pending', 'quoted'].includes(b.status));
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status));

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-medium font-sans">{booking.project_type || 'Projet'}</h3>
          <p className="text-sm text-muted-foreground">
            {booking.professional_profiles?.company_name || 'Client'}
          </p>
        </div>
        <Badge className={statusConfig[booking.status]?.className}>
          {statusConfig[booking.status]?.label}
        </Badge>
      </div>
      <div className="space-y-2 text-sm text-muted-foreground font-sans">
        <p className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {format(new Date(booking.start_date), 'dd MMM', { locale: fr })} - {format(new Date(booking.end_date), 'dd MMM yyyy', { locale: fr })}
        </p>
        {booking.location && (
          <p className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {booking.location}
          </p>
        )}
        {booking.final_price && (
          <p className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {booking.final_price.toLocaleString('fr-FR')} MAD
          </p>
        )}
      </div>
      {booking.project_description && (
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {booking.project_description}
        </p>
      )}
    </div>
  );

  return (
    <DashboardLayout title="Mes Réservations" navItems={modelNavItems}>
      <div className="space-y-8">
        {/* Pending */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">En attente ({pendingBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm font-sans">
                Aucune demande en attente
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pendingBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Confirmed */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Confirmées ({confirmedBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {confirmedBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm font-sans">
                Aucune réservation confirmée
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {confirmedBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Past */}
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Historique ({pastBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {pastBookings.length === 0 ? (
              <p className="text-muted-foreground text-sm font-sans">
                Aucune réservation passée
              </p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {pastBookings.map((booking) => (
                  <BookingCard key={booking.id} booking={booking} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
