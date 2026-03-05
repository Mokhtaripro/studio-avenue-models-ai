import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { professionalNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Search, Heart, FileText, AlertCircle } from 'lucide-react';

interface ProfessionalProfile {
  id: string;
  company_name: string;
  subscription_status: string;
  subscription_end: string | null;
}

interface Booking {
  id: string;
  status: string;
  start_date: string;
  project_type: string | null;
  model_profiles: {
    pseudo: string | null;
  } | null;
}

export default function ProDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modelCount, setModelCount] = useState(0);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/connexion');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    // Fetch professional profile
    const { data: profileData } = await supabase
      .from('professional_profiles')
      .select('id, company_name, subscription_status, subscription_end')
      .eq('user_id', user!.id)
      .maybeSingle();

    setProfile(profileData);

    if (profileData) {
      // Fetch recent bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select(`
          id, status, start_date, project_type,
          model_profiles (pseudo)
        `)
        .eq('professional_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(5);

      setBookings(bookingsData || []);
    }

    // Fetch approved model count
    const { count } = await supabase
      .from('model_profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    setModelCount(count || 0);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-champagne/20 text-champagne-foreground',
    active: 'bg-green-100 text-green-800',
    expired: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800',
  };

  return (
    <DashboardLayout title="Tableau de bord" navItems={professionalNavItems}>
      {/* Status Banner */}
      {profile?.subscription_status === 'pending' && (
        <div className="mb-6 p-4 bg-champagne/10 border border-champagne/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-champagne" />
          <div>
            <p className="font-medium font-sans">Compte en attente de validation</p>
            <p className="text-sm text-muted-foreground font-sans">
              Notre équipe examine votre demande. Vous serez notifié sous 48h.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Abonnement</CardTitle>
            <Badge className={statusColors[profile?.subscription_status || 'pending']}>
              {profile?.subscription_status === 'pending' && 'En attente'}
              {profile?.subscription_status === 'active' && 'Actif'}
              {profile?.subscription_status === 'expired' && 'Expiré'}
              {profile?.subscription_status === 'cancelled' && 'Annulé'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{profile?.company_name || 'Entreprise'}</p>
            {profile?.subscription_end && (
              <p className="text-xs text-muted-foreground mt-1">
                Expire le {new Date(profile.subscription_end).toLocaleDateString('fr-FR')}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Mannequins disponibles</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{modelCount}</p>
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => navigate('/pro/search')}
            >
              Rechercher →
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Réservations</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{bookings.length}</p>
            <Button
              variant="link"
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => navigate('/pro/bookings')}
            >
              Voir les réservations →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions & Recent Bookings */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="luxuryOutline" onClick={() => navigate('/pro/search')}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher un mannequin
            </Button>
            <Button variant="luxuryOutline" onClick={() => navigate('/pro/favorites')}>
              <Heart className="h-4 w-4 mr-2" />
              Voir mes favoris
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Réservations récentes</CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-muted-foreground text-sm font-sans">
                Aucune réservation pour le moment.
              </p>
            ) : (
              <ul className="space-y-3">
                {bookings.map((booking) => (
                  <li key={booking.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium font-sans text-sm">
                        {booking.model_profiles?.pseudo || 'Mannequin'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {booking.project_type || 'Projet'} - {new Date(booking.start_date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <Badge variant="outline">{booking.status}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
