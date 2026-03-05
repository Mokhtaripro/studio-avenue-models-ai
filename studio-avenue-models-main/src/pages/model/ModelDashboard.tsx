import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardLayout, { modelNavItems } from '@/components/dashboard/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Calendar, FileText, AlertCircle } from 'lucide-react';

interface ModelProfile {
  id: string;
  pseudo: string | null;
  status: string;
  is_featured: boolean;
}

interface Booking {
  id: string;
  status: string;
  start_date: string;
  project_type: string | null;
}

export default function ModelDashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ModelProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [photoCount, setPhotoCount] = useState(0);

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
    // Fetch model profile
    const { data: profileData } = await supabase
      .from('model_profiles')
      .select('id, pseudo, status, is_featured')
      .eq('user_id', user!.id)
      .maybeSingle();
    
    setProfile(profileData);

    if (profileData) {
      // Fetch bookings
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('id, status, start_date, project_type')
        .eq('model_id', profileData.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      setBookings(bookingsData || []);

      // Fetch photo count
      const { count } = await supabase
        .from('model_photos')
        .select('*', { count: 'exact', head: true })
        .eq('model_id', profileData.id);
      
      setPhotoCount(count || 0);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  }

  const statusColors: Record<string, string> = {
    pending: 'bg-champagne/20 text-champagne-foreground',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    suspended: 'bg-gray-100 text-gray-800',
  };

  return (
    <DashboardLayout title="Tableau de bord" navItems={modelNavItems}>
      {/* Status Banner */}
      {profile?.status === 'pending' && (
        <div className="mb-6 p-4 bg-champagne/10 border border-champagne/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-champagne" />
          <div>
            <p className="font-medium font-sans">Profil en cours de validation</p>
            <p className="text-sm text-muted-foreground font-sans">
              Notre équipe examine votre profil. Vous serez notifié une fois approuvé.
            </p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Statut</CardTitle>
            <Badge className={statusColors[profile?.status || 'pending']}>
              {profile?.status === 'pending' && 'En attente'}
              {profile?.status === 'approved' && 'Approuvé'}
              {profile?.status === 'rejected' && 'Refusé'}
              {profile?.status === 'suspended' && 'Suspendu'}
            </Badge>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">
              {profile?.is_featured ? 'Mannequin Vedette' : 'Mannequin'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium font-sans">Photos</CardTitle>
            <Camera className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-serif">{photoCount}</p>
            <Button 
              variant="link" 
              className="p-0 h-auto text-xs text-muted-foreground"
              onClick={() => navigate('/model/photos')}
            >
              Gérer les photos →
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
              onClick={() => navigate('/model/bookings')}
            >
              Voir les réservations →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button variant="luxuryOutline" onClick={() => navigate('/model/profile')}>
              Compléter mon profil
            </Button>
            <Button variant="luxuryOutline" onClick={() => navigate('/model/photos')}>
              Ajouter des photos
            </Button>
            <Button variant="luxuryOutline" onClick={() => navigate('/model/availability')}>
              Gérer mes disponibilités
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif">Prochaines réservations</CardTitle>
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
                      <p className="font-medium font-sans text-sm">{booking.project_type || 'Projet'}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(booking.start_date).toLocaleDateString('fr-FR')}
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
